import 'dart:convert';
import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';
import 'package:com.urbaevent/model/events/ResponseEventRegistration.dart';
import 'package:com.urbaevent/model/events/ResponseEvents.dart';
import 'package:com.urbaevent/ui/auth/SignIn.dart';
import 'package:com.urbaevent/ui/content_ui/event/sub_views/ConferenceList.dart';
import 'package:com.urbaevent/ui/content_ui/event/sub_views/EventInformation.dart';
import 'package:com.urbaevent/ui/content_ui/event/sub_views/EventPresentation.dart';
import 'package:com.urbaevent/ui/content_ui/event/sub_views/MySchedule.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomBottomBar.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';

import '../home/HomePage.dart';
import 'sub_views/Plan.dart';
import 'package:http/http.dart' as http;

import 'sub_views/PortalList.dart';

class EventDetails extends StatefulWidget {
  final EventItem data;
  final bool isRegisteredForEvent;
  final int confirmed;
  final String type;

  EventDetails(
      {required this.data,
      required this.isRegisteredForEvent,
      required this.confirmed,
      required this.type});

  @override
  State<StatefulWidget> createState() => _EventDetails();
}

class _EventDetails extends State<EventDetails> {
  var loader = false;
  var confirmed = Const.eventConfirmationPending;
  var isRegisteredForEvent = false;

  ResponseEventRegistration? responseEventRegistration;

  void onCallBack() {
    setState(() {
      Navigator.pop(context);
    });
  }

  void handleCallback(int val) {
    setState(() {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => HomePage(val)),
        (route) => false,
      );
    });
  }

  Future<void> _downloadFile() async {
    try {
      setState(() {
        loader = true;
      });
      Preference preference = await Preference.getInstance();

      final jwtToken = preference.getToken();

      final url = Uri.parse(
          Urls.baseURL + Urls.downloadEbadge + Const.registrationId.toString());
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      if (response.statusCode == 200) {
        // Get the application's document directory
        final appDir = await getApplicationCacheDirectory();
        final filePath = appDir.path + '/' + widget.data.name + '.pdf';

        // Create and write the file
        File file = File(filePath);
        await file.writeAsBytes(response.bodyBytes);

        // File saved successfully
        print('File saved to: $filePath');
        if (await file.exists()) {
          await OpenFile.open(filePath);
        } else {
          throw Exception('File does not exist at $filePath');
        }
        setState(() {
          loader = false;
        });
      } else {
        setState(() {
          loader = false;
        });
        // Handle the HTTP error
        throw Exception('Failed to download file: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        loader = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> requestPermission() async {
    // Define the permission you want to request
    DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();

    // Get Android device info
    PermissionStatus status;

    try {
      AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;

      if (int.parse(androidInfo.version.release) >= 13 && Platform.isAndroid) {
        status = await Permission.photos.request();
      } else {
        status = await Permission.storage.request();
      }
    } catch (e) {
      status = await Permission.storage.request();
    }

    // Handle the permission status
    if (status.isGranted) {
      // Permission is granted
      _downloadFile();
    } else if (status.isDenied) {
      // Permission is denied
      print('Permission denied');
    } else if (status.isPermanentlyDenied) {
      // Permission is permanently denied, show a user-friendly dialog
      print('Permission permanently denied');
      openAppSettings(); // Open the app settings to allow the user to grant permission manually
    }
  }

  Future<void> registerToEventAsVisitor() async {
    setState(() {
      loader = true;
    });

    Preference preference = await Preference.getInstance();

    if (preference.getToken().isNotEmpty) {
      final jwtToken = preference.getToken();

      final url = Uri.parse(Urls.baseURL + Urls.registrations);

      final jsonData = {
        "data": {
          "user": preference.getLoginDetails()!.user.id,
          "event": widget.data.id,
          "type": "visitor",
          "confirmed": true
        }
      };

      print(jsonEncode(jsonData).toString());

      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $jwtToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(jsonData),
      );

      final parsedJson = jsonDecode(response.body);

      if (response.statusCode == HttpStatus.ok) {
        responseEventRegistration =
            ResponseEventRegistration.fromJson(parsedJson);
        setState(() {
          isRegisteredForEvent = true;
          confirmed = Const.eventConfirmed;
          Const.registrationId = responseEventRegistration!.data!.id!;
          requestPermission();
        });
      } else {
        final error = ResponseError.fromJson(parsedJson);
        Utils.showToast(error.error.message);
      }
    } else {
      Navigator.push(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => SignIn(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            const begin = Offset(1.0, 0.0); // Slide from right
            const end = Offset.zero;
            const curve = Curves.easeInOut;
            var tween =
                Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
            var offsetAnimation = animation.drive(tween);
            return SlideTransition(position: offsetAnimation, child: child);
          },
        ),
      );
    }

    setState(() {
      loader = false;
    });
  }

  Future<void> registerToEventAsExhibitor() async {
    setState(() {
      loader = true;
    });

    Preference preference = await Preference.getInstance();

    if (preference.getToken().isNotEmpty) {
      final jwtToken = preference.getToken();

      final url = Uri.parse(Urls.baseURL + Urls.registrations);

      final jsonData = {
        "data": {
          "user": preference.getLoginDetails()!.user.id,
          "event": widget.data.id,
          "type": "exhibitor",
        }
      };

      print(jsonEncode(jsonData).toString());

      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $jwtToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(jsonData),
      );

      final parsedJson = jsonDecode(response.body);

      if (response.statusCode == HttpStatus.ok) {
        responseEventRegistration =
            ResponseEventRegistration.fromJson(parsedJson);
        setState(() {
          isRegisteredForEvent = true;
        });
        Utils.showDialogMessage(
            context,
            Intl.message("msg_notified_once_exhibitor",
                name: "msg_notified_once_exhibitor"));
      } else {
        final error = ResponseError.fromJson(parsedJson);
        Utils.showToast(error.error.message);
      }
    } else {
      Navigator.push(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => SignIn(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            const begin = Offset(1.0, 0.0); // Slide from right
            const end = Offset.zero;
            const curve = Curves.easeInOut;
            var tween =
                Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
            var offsetAnimation = animation.drive(tween);
            return SlideTransition(position: offsetAnimation, child: child);
          },
        ),
      );
    }

    setState(() {
      loader = false;
    });
  }

  @override
  void initState() {
    super.initState();
    // Set the initial status bar color to transparent
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
    ));
    isRegisteredForEvent = widget.isRegisteredForEvent;
    confirmed = widget.confirmed;
    Const.eventID = widget.data.id;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: null,
      body: Stack(
        children: [
          Container(color: Color.fromRGBO(249, 249, 255, 1)),
          Container(
            child: Flex(
              direction: Axis.vertical,
              children: [
                Expanded(
                  flex: 1,
                  child: SingleChildScrollView(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          //Event type normal
                          SizedBox(
                            height: 300,
                          ),
                          if (widget.type.toLowerCase() != "simple")
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      PageRouteBuilder(
                                        pageBuilder: (context, animation,
                                                secondaryAnimation) =>
                                            EventPresentation(
                                                widget.data.presentationUrl ??
                                                    ""),
                                        transitionsBuilder: (context, animation,
                                            secondaryAnimation, child) {
                                          const begin = Offset(
                                              1.0, 0.0); // Slide from right
                                          const end = Offset.zero;
                                          const curve = Curves.easeInOut;
                                          var tween = Tween(
                                                  begin: begin, end: end)
                                              .chain(CurveTween(curve: curve));
                                          var offsetAnimation =
                                              animation.drive(tween);
                                          return SlideTransition(
                                              position: offsetAnimation,
                                              child: child);
                                        },
                                      ),
                                    );
                                  },
                                  child: Card(
                                    margin:
                                        EdgeInsets.only(right: 8, bottom: 16),
                                    elevation: 3.0,
                                    shadowColor: Color.fromRGBO(
                                        0, 0, 0, 0.2549019607843137),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    color: Colors.white,
                                    child: Container(
                                      height:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      width:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                    'assets/bg_circle_orange.svg'),
                                                SvgPicture.asset(
                                                    'assets/ic_presentation.svg'),
                                              ]),
                                          Padding(
                                            padding: const EdgeInsets.only(
                                                top: 28.0),
                                            child: Text(
                                              Intl.message("presentation",
                                                  name: "presentation"),
                                              style: GoogleFonts.roboto(
                                                  color: Color.fromRGBO(
                                                      51, 51, 51, 1),
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      PageRouteBuilder(
                                        pageBuilder: (context, animation,
                                                secondaryAnimation) =>
                                            ConferenceList(
                                                widget.data.id,
                                                confirmed ==
                                                    Const.eventConfirmed,
                                                widget.type),
                                        transitionsBuilder: (context, animation,
                                            secondaryAnimation, child) {
                                          const begin = Offset(
                                              1.0, 0.0); // Slide from right
                                          const end = Offset.zero;
                                          const curve = Curves.easeInOut;
                                          var tween = Tween(
                                                  begin: begin, end: end)
                                              .chain(CurveTween(curve: curve));
                                          var offsetAnimation =
                                              animation.drive(tween);
                                          return SlideTransition(
                                              position: offsetAnimation,
                                              child: child);
                                        },
                                      ),
                                    );
                                  },
                                  child: Card(
                                    margin:
                                        EdgeInsets.only(left: 8, bottom: 16),
                                    elevation: 3.0,
                                    shadowColor: Color.fromRGBO(
                                        0, 0, 0, 0.2549019607843137),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    color: Colors.white,
                                    child: Container(
                                      height:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      width:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                    'assets/bg_circle_orange.svg'),
                                                SvgPicture.asset(
                                                    'assets/ic_conference.svg'),
                                              ]),
                                          Padding(
                                            padding: const EdgeInsets.only(
                                                top: 28.0),
                                            child: Text(
                                              Intl.message("conferences",
                                                  name: "conferences"),
                                              style: GoogleFonts.roboto(
                                                  color: Color.fromRGBO(
                                                      51, 51, 51, 1),
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                )
                              ],
                            ),
                          if (widget.type.toLowerCase() != "simple")
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                if (confirmed == Const.eventConfirmed)
                                  GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        PageRouteBuilder(
                                          pageBuilder: (context, animation,
                                                  secondaryAnimation) =>
                                              MySchedule(widget.data.id),
                                          transitionsBuilder: (context,
                                              animation,
                                              secondaryAnimation,
                                              child) {
                                            const begin = Offset(
                                                1.0, 0.0); // Slide from right
                                            const end = Offset.zero;
                                            const curve = Curves.easeInOut;
                                            var tween = Tween(
                                                    begin: begin, end: end)
                                                .chain(
                                                    CurveTween(curve: curve));
                                            var offsetAnimation =
                                                animation.drive(tween);
                                            return SlideTransition(
                                                position: offsetAnimation,
                                                child: child);
                                          },
                                        ),
                                      );
                                    },
                                    child: Card(
                                      margin:
                                          EdgeInsets.only(right: 8, bottom: 16),
                                      elevation: 3.0,
                                      shadowColor: Color.fromRGBO(
                                          0, 0, 0, 0.2549019607843137),
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(10.0),
                                      ),
                                      color: Colors.white,
                                      child: Container(
                                        height:
                                            (MediaQuery.of(context).size.width /
                                                    2) -
                                                26,
                                        width:
                                            (MediaQuery.of(context).size.width /
                                                    2) -
                                                26,
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Stack(
                                                alignment: Alignment.center,
                                                children: [
                                                  SvgPicture.asset(
                                                      'assets/bg_circle_orange.svg'),
                                                  SvgPicture.asset(
                                                      'assets/ic_calender.svg'),
                                                ]),
                                            Padding(
                                              padding: const EdgeInsets.only(
                                                  top: 28.0),
                                              child: Text(
                                                Intl.message("my_schedule",
                                                    name: "my_schedule"),
                                                style: GoogleFonts.roboto(
                                                    color: Color.fromRGBO(
                                                        51, 51, 51, 1),
                                                    fontStyle: FontStyle.normal,
                                                    fontSize: 16,
                                                    fontWeight:
                                                        FontWeight.w700),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                if (confirmed != Const.eventConfirmed)
                                  GestureDetector(
                                    onTap: () {
                                      Utils.showToast(
                                        Intl.message("msg_register_first",
                                            name: "msg_register_first"),
                                      );
                                    },
                                    child: Card(
                                      margin:
                                          EdgeInsets.only(right: 8, bottom: 16),
                                      elevation: 3.0,
                                      shadowColor: Colors.transparent,
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(10.0),
                                      ),
                                      color: Color.fromRGBO(69, 152, 209, 0.2),
                                      child: Container(
                                        height:
                                            (MediaQuery.of(context).size.width /
                                                    2) -
                                                26,
                                        width:
                                            (MediaQuery.of(context).size.width /
                                                    2) -
                                                26,
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Stack(
                                                alignment: Alignment.center,
                                                children: [
                                                  SvgPicture.asset(
                                                    'assets/bg_circle_orange.svg',
                                                    colorFilter:
                                                        ColorFilter.mode(
                                                            ThemeColor
                                                                .colorAccent,
                                                            BlendMode.srcATop),
                                                  ),
                                                  SvgPicture.asset(
                                                      'assets/ic_calender.svg'),
                                                ]),
                                            Padding(
                                              padding: const EdgeInsets.only(
                                                  top: 28.0),
                                              child: Text(
                                                Intl.message("my_schedule",
                                                    name: "my_schedule"),
                                                style: GoogleFonts.roboto(
                                                    color:
                                                        ThemeColor.colorAccent,
                                                    fontStyle: FontStyle.normal,
                                                    fontSize: 16,
                                                    fontWeight:
                                                        FontWeight.w700),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      PageRouteBuilder(
                                        pageBuilder: (context, animation,
                                                secondaryAnimation) =>
                                            PortalList(widget.data.id),
                                        transitionsBuilder: (context, animation,
                                            secondaryAnimation, child) {
                                          const begin = Offset(
                                              1.0, 0.0); // Slide from right
                                          const end = Offset.zero;
                                          const curve = Curves.easeInOut;
                                          var tween = Tween(
                                                  begin: begin, end: end)
                                              .chain(CurveTween(curve: curve));
                                          var offsetAnimation =
                                              animation.drive(tween);
                                          return SlideTransition(
                                              position: offsetAnimation,
                                              child: child);
                                        },
                                      ),
                                    );
                                  },
                                  child: Card(
                                    margin:
                                        EdgeInsets.only(left: 8, bottom: 16),
                                    elevation: 3.0,
                                    shadowColor: Color.fromRGBO(
                                        0, 0, 0, 0.2549019607843137),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    color: Colors.white,
                                    child: Container(
                                      height:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      width:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                    'assets/ic_portal.svg'),
                                              ]),
                                          Padding(
                                            padding: const EdgeInsets.only(
                                                top: 28.0),
                                            child: Text(
                                              Intl.message("portal",
                                                  name: "portal"),
                                              style: GoogleFonts.roboto(
                                                  color: Color.fromRGBO(
                                                      51, 51, 51, 1),
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                )
                              ],
                            ),
                          if (widget.type.toLowerCase() != "simple")
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      PageRouteBuilder(
                                        pageBuilder: (context, animation,
                                                secondaryAnimation) =>
                                            Plan(widget.data.locationLatLng),
                                        transitionsBuilder: (context, animation,
                                            secondaryAnimation, child) {
                                          const begin = Offset(
                                              1.0, 0.0); // Slide from right
                                          const end = Offset.zero;
                                          const curve = Curves.easeInOut;
                                          var tween = Tween(
                                                  begin: begin, end: end)
                                              .chain(CurveTween(curve: curve));
                                          var offsetAnimation =
                                              animation.drive(tween);
                                          return SlideTransition(
                                              position: offsetAnimation,
                                              child: child);
                                        },
                                      ),
                                    );
                                  },
                                  child: Card(
                                    margin:
                                        EdgeInsets.only(right: 8, bottom: 16),
                                    elevation: 3.0,
                                    shadowColor: Color.fromRGBO(
                                        0, 0, 0, 0.2549019607843137),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    color: Colors.white,
                                    child: Container(
                                      height:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      width:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                    'assets/ic_plan.svg'),
                                              ]),
                                          Padding(
                                            padding: const EdgeInsets.only(
                                                top: 28.0),
                                            child: Text(
                                              Intl.message("plan",
                                                  name: "plan"),
                                              style: GoogleFonts.roboto(
                                                  color: Color.fromRGBO(
                                                      51, 51, 51, 1),
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      PageRouteBuilder(
                                        pageBuilder: (context, animation,
                                                secondaryAnimation) =>
                                            EventInformation(widget.data),
                                        transitionsBuilder: (context, animation,
                                            secondaryAnimation, child) {
                                          const begin = Offset(
                                              1.0, 0.0); // Slide from right
                                          const end = Offset.zero;
                                          const curve = Curves.easeInOut;
                                          var tween = Tween(
                                                  begin: begin, end: end)
                                              .chain(CurveTween(curve: curve));
                                          var offsetAnimation =
                                              animation.drive(tween);
                                          return SlideTransition(
                                              position: offsetAnimation,
                                              child: child);
                                        },
                                      ),
                                    );
                                  },
                                  child: Card(
                                    margin:
                                        EdgeInsets.only(left: 8, bottom: 16),
                                    elevation: 3.0,
                                    shadowColor: Color.fromRGBO(
                                        0, 0, 0, 0.2549019607843137),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    color: Colors.white,
                                    child: Container(
                                      height:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      width:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                    'assets/bg_circle_orange.svg'),
                                                SvgPicture.asset(
                                                    'assets/ic_chat.svg'),
                                              ]),
                                          Padding(
                                            padding:
                                                const EdgeInsets.only(top: 28),
                                            child: Text(
                                              Intl.message("event_info",
                                                  name: "event_info"),
                                              style: GoogleFonts.roboto(
                                                  color: Color.fromRGBO(
                                                      51, 51, 51, 1),
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                )
                              ],
                            ),
                          //Event type simple
                          if (widget.type.toLowerCase() == "simple")
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    if (widget.data.presentationUrl != null &&
                                        widget
                                            .data.presentationUrl!.isNotEmpty) {
                                      Navigator.push(
                                        context,
                                        PageRouteBuilder(
                                          pageBuilder: (context, animation,
                                                  secondaryAnimation) =>
                                              EventPresentation(
                                                  widget.data.presentationUrl ??
                                                      ""),
                                          transitionsBuilder: (context,
                                              animation,
                                              secondaryAnimation,
                                              child) {
                                            const begin = Offset(
                                                1.0, 0.0); // Slide from right
                                            const end = Offset.zero;
                                            const curve = Curves.easeInOut;
                                            var tween = Tween(
                                                    begin: begin, end: end)
                                                .chain(
                                                    CurveTween(curve: curve));
                                            var offsetAnimation =
                                                animation.drive(tween);
                                            return SlideTransition(
                                                position: offsetAnimation,
                                                child: child);
                                          },
                                        ),
                                      );
                                    } else {
                                      Utils.showToast(Intl.message(
                                          "msg_url_not_found",
                                          name: "msg_url_not_found"));
                                    }
                                  },
                                  child: Card(
                                    margin:
                                        EdgeInsets.only(right: 8, bottom: 16),
                                    elevation: 3.0,
                                    shadowColor: Color.fromRGBO(
                                        0, 0, 0, 0.2549019607843137),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    color: Colors.white,
                                    child: Container(
                                      height:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      width:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                    'assets/bg_circle_orange.svg'),
                                                SvgPicture.asset(
                                                    'assets/ic_presentation.svg'),
                                              ]),
                                          Padding(
                                            padding: const EdgeInsets.only(
                                                top: 28.0),
                                            child: Text(
                                              Intl.message("presentation",
                                                  name: "presentation"),
                                              style: GoogleFonts.roboto(
                                                  color: Color.fromRGBO(
                                                      51, 51, 51, 1),
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      PageRouteBuilder(
                                        pageBuilder: (context, animation,
                                                secondaryAnimation) =>
                                            ConferenceList(
                                                widget.data.id,
                                                confirmed ==
                                                    Const.eventConfirmed,
                                                widget.data.registrationType ??
                                                    "visitor"),
                                        transitionsBuilder: (context, animation,
                                            secondaryAnimation, child) {
                                          const begin = Offset(
                                              1.0, 0.0); // Slide from right
                                          const end = Offset.zero;
                                          const curve = Curves.easeInOut;
                                          var tween = Tween(
                                                  begin: begin, end: end)
                                              .chain(CurveTween(curve: curve));
                                          var offsetAnimation =
                                              animation.drive(tween);
                                          return SlideTransition(
                                              position: offsetAnimation,
                                              child: child);
                                        },
                                      ),
                                    );
                                  },
                                  child: Card(
                                    margin:
                                        EdgeInsets.only(left: 8, bottom: 16),
                                    elevation: 3.0,
                                    shadowColor: Color.fromRGBO(
                                        0, 0, 0, 0.2549019607843137),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    color: Colors.white,
                                    child: Container(
                                      height:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      width:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                    'assets/bg_circle_orange.svg'),
                                                SvgPicture.asset(
                                                    'assets/ic_conference.svg'),
                                              ]),
                                          Padding(
                                            padding: const EdgeInsets.only(
                                                top: 28.0),
                                            child: Text(
                                              Intl.message("conferences",
                                                  name: "conferences"),
                                              style: GoogleFonts.roboto(
                                                  color: Color.fromRGBO(
                                                      51, 51, 51, 1),
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                )
                              ],
                            ),
                          if (widget.type.toLowerCase() == "simple")
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                if (confirmed == Const.eventConfirmed)
                                  GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        PageRouteBuilder(
                                          pageBuilder: (context, animation,
                                                  secondaryAnimation) =>
                                              MySchedule(widget.data.id),
                                          transitionsBuilder: (context,
                                              animation,
                                              secondaryAnimation,
                                              child) {
                                            const begin = Offset(
                                                1.0, 0.0); // Slide from right
                                            const end = Offset.zero;
                                            const curve = Curves.easeInOut;
                                            var tween = Tween(
                                                    begin: begin, end: end)
                                                .chain(
                                                    CurveTween(curve: curve));
                                            var offsetAnimation =
                                                animation.drive(tween);
                                            return SlideTransition(
                                                position: offsetAnimation,
                                                child: child);
                                          },
                                        ),
                                      );
                                    },
                                    child: Card(
                                      margin:
                                          EdgeInsets.only(right: 8, bottom: 16),
                                      elevation: 3.0,
                                      shadowColor: Color.fromRGBO(
                                          0, 0, 0, 0.2549019607843137),
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(10.0),
                                      ),
                                      color: Colors.white,
                                      child: Container(
                                        height:
                                            (MediaQuery.of(context).size.width /
                                                    2) -
                                                26,
                                        width:
                                            (MediaQuery.of(context).size.width /
                                                    2) -
                                                26,
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Stack(
                                                alignment: Alignment.center,
                                                children: [
                                                  SvgPicture.asset(
                                                      'assets/bg_circle_orange.svg'),
                                                  SvgPicture.asset(
                                                      'assets/ic_calender.svg'),
                                                ]),
                                            Padding(
                                              padding: const EdgeInsets.only(
                                                  top: 28.0),
                                              child: Text(
                                                Intl.message("my_schedule",
                                                    name: "my_schedule"),
                                                style: GoogleFonts.roboto(
                                                    color: Color.fromRGBO(
                                                        51, 51, 51, 1),
                                                    fontStyle: FontStyle.normal,
                                                    fontSize: 16,
                                                    fontWeight:
                                                        FontWeight.w700),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                if (confirmed != Const.eventConfirmed)
                                  GestureDetector(
                                    onTap: () {
                                      Utils.showToast(
                                        Intl.message("msg_register_first",
                                            name: "msg_register_first"),
                                      );
                                    },
                                    child: Card(
                                      margin:
                                          EdgeInsets.only(right: 8, bottom: 16),
                                      elevation: 3.0,
                                      shadowColor: Colors.transparent,
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(10.0),
                                      ),
                                      color: Color.fromRGBO(69, 152, 209, 0.2),
                                      child: Container(
                                        height:
                                            (MediaQuery.of(context).size.width /
                                                    2) -
                                                26,
                                        width:
                                            (MediaQuery.of(context).size.width /
                                                    2) -
                                                26,
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Stack(
                                                alignment: Alignment.center,
                                                children: [
                                                  SvgPicture.asset(
                                                    'assets/bg_circle_orange.svg',
                                                    colorFilter:
                                                        ColorFilter.mode(
                                                            ThemeColor
                                                                .colorAccent,
                                                            BlendMode.srcATop),
                                                  ),
                                                  SvgPicture.asset(
                                                      'assets/ic_calender.svg'),
                                                ]),
                                            Padding(
                                              padding: const EdgeInsets.only(
                                                  top: 28.0),
                                              child: Text(
                                                Intl.message("my_schedule",
                                                    name: "my_schedule"),
                                                style: GoogleFonts.roboto(
                                                    color:
                                                        ThemeColor.colorAccent,
                                                    fontStyle: FontStyle.normal,
                                                    fontSize: 16,
                                                    fontWeight:
                                                        FontWeight.w700),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      PageRouteBuilder(
                                        pageBuilder: (context, animation,
                                                secondaryAnimation) =>
                                            Plan(widget.data.locationLatLng),
                                        transitionsBuilder: (context, animation,
                                            secondaryAnimation, child) {
                                          const begin = Offset(
                                              1.0, 0.0); // Slide from right
                                          const end = Offset.zero;
                                          const curve = Curves.easeInOut;
                                          var tween = Tween(
                                                  begin: begin, end: end)
                                              .chain(CurveTween(curve: curve));
                                          var offsetAnimation =
                                              animation.drive(tween);
                                          return SlideTransition(
                                              position: offsetAnimation,
                                              child: child);
                                        },
                                      ),
                                    );
                                  },
                                  child: Card(
                                    margin:
                                        EdgeInsets.only(left: 8, bottom: 16),
                                    elevation: 3.0,
                                    shadowColor: Color.fromRGBO(
                                        0, 0, 0, 0.2549019607843137),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    color: Colors.white,
                                    child: Container(
                                      height:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      width:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                    'assets/ic_plan.svg'),
                                              ]),
                                          Padding(
                                            padding: const EdgeInsets.only(
                                                top: 28.0),
                                            child: Text(
                                              Intl.message("plan",
                                                  name: "plan"),
                                              style: GoogleFonts.roboto(
                                                  color: Color.fromRGBO(
                                                      51, 51, 51, 1),
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          if (widget.type.toLowerCase() == "simple")
                            Row(
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      PageRouteBuilder(
                                        pageBuilder: (context, animation,
                                                secondaryAnimation) =>
                                            EventInformation(widget.data),
                                        transitionsBuilder: (context, animation,
                                            secondaryAnimation, child) {
                                          const begin = Offset(
                                              1.0, 0.0); // Slide from right
                                          const end = Offset.zero;
                                          const curve = Curves.easeInOut;
                                          var tween = Tween(
                                                  begin: begin, end: end)
                                              .chain(CurveTween(curve: curve));
                                          var offsetAnimation =
                                              animation.drive(tween);
                                          return SlideTransition(
                                              position: offsetAnimation,
                                              child: child);
                                        },
                                      ),
                                    );
                                  },
                                  child: Card(
                                    margin: EdgeInsets.only(bottom: 16),
                                    elevation: 3.0,
                                    shadowColor: Color.fromRGBO(
                                        0, 0, 0, 0.2549019607843137),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    color: Colors.white,
                                    child: Container(
                                      height:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      width:
                                          (MediaQuery.of(context).size.width /
                                                  2) -
                                              26,
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                    'assets/bg_circle_orange.svg'),
                                                SvgPicture.asset(
                                                    'assets/ic_chat.svg'),
                                              ]),
                                          Padding(
                                            padding:
                                                const EdgeInsets.only(top: 28),
                                            child: Text(
                                              Intl.message("event_info",
                                                  name: "event_info"),
                                              style: GoogleFonts.roboto(
                                                  color: Color.fromRGBO(
                                                      51, 51, 51, 1),
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                )
                              ],
                            ),
                          SizedBox(
                            height: 20,
                          ),
                          Center(
                              child: TextButton(
                                  style: TextButton.styleFrom(
                                    fixedSize: Size(290, 50),
                                    elevation: 6,
                                    shadowColor: Color.fromRGBO(
                                        158, 158, 158, 0.7450980392156863),
                                    backgroundColor:
                                        Color.fromRGBO(69, 152, 209, 1),
                                    // Set the background color to black
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(
                                          25.0), // Set the border radius
                                    ),
                                  ),
                                  onPressed: () {
                                    if (confirmed ==
                                        Const.eventConfirmationRejected) {
                                      Utils.showToast(Intl.message(
                                          "request_rejected",
                                          name: "request_rejected"));
                                    } else if (confirmed ==
                                        Const.eventConfirmed) {
                                      requestPermission();
                                    } else {
                                      if (confirmed != Const.eventConfirmed)
                                        registerToEventAsVisitor();
                                    }
                                  },
                                  child: Text(
                                      Intl.message("download_e_badge",
                                          name: "download_e_badge"),
                                      style: GoogleFonts.roboto(
                                          shadows: [
                                            Shadow(
                                              color:
                                                  Color.fromRGBO(0, 0, 0, 0.25),
                                              offset: Offset(3, 3),
                                              blurRadius: 8,
                                            ),
                                          ],
                                          color: Colors.white,
                                          fontSize: 20,
                                          fontWeight: FontWeight.w700)))),
                          SizedBox(
                            height: 20,
                          ),
                          if (confirmed != Const.eventConfirmed &&
                              widget.type.toLowerCase() != "simple")
                            Center(
                                child: TextButton(
                                    onPressed: () {
                                      if (!isRegisteredForEvent) {
                                        registerToEventAsExhibitor();
                                      }
                                      if (confirmed ==
                                          Const.eventConfirmationRejected) {
                                        Utils.showToast(Intl.message(
                                            "request_rejected",
                                            name: "request_rejected"));
                                      }
                                    },
                                    child: Text(
                                        Intl.message("book_booth",
                                            name: "book_booth"),
                                        style: GoogleFonts.roboto(
                                            decoration:
                                                TextDecoration.underline,
                                            color:
                                                Color.fromRGBO(69, 152, 209, 1),
                                            fontSize: 16,
                                            fontWeight: FontWeight.w400)))),
                          SizedBox(
                            height: 70,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          CachedNetworkImage(
            fit: BoxFit.fitWidth,
            height: 250,
            width: MediaQuery.of(context).size.width,
            imageUrl: Urls.imageURL + widget.data.banner!.url,
            // Replace with your image URL
            placeholder: (context, url) => Container(
                alignment: Alignment.center,
                height: 50,
                child: Center(
                    child: CircularProgressIndicator(
                  color: Colors.black.withValues(alpha: 0.2),
                ))),
          ),
          CustomToolbar(
              " ",
              onCallBack,
              Utils.notificationCount,
              widget.data.registrationType == "exhibitor" &&
                  confirmed == Const.eventConfirmed),
          Column(
            children: [
              SizedBox(
                height: 210,
              ),
              Card(
                margin: EdgeInsets.symmetric(horizontal: 16),
                elevation: 3.0,
                shadowColor: Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
                color: Colors.white,
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(height: 8),
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.only(bottom: 8.0),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                // Set the border radius here
                                child: CachedNetworkImage(
                                  fit: BoxFit.cover,
                                  height: 72,
                                  width: 72,
                                  imageUrl:
                                      Urls.imageURL + widget.data.logo!.url!,
                                  // Replace with your image URL
                                  placeholder: (context, url) => Container(
                                      alignment: Alignment.center,
                                      height: 50,
                                      child: Center(
                                          child: CircularProgressIndicator(
                                        color: Colors.black.withValues(alpha: 0.2),
                                      ))),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      Flexible(
                        flex: 1,
                        fit: FlexFit.tight,
                        child: Container(
                          margin: EdgeInsets.all(10),
                          alignment: Alignment.topLeft,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.data.name,
                                overflow: TextOverflow.ellipsis,
                                maxLines: 1,
                                style: GoogleFonts.roboto(
                                    color: Color.fromRGBO(51, 51, 51, 1),
                                    fontStyle: FontStyle.normal,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700),
                              ),
                              SizedBox(
                                height: 5,
                              ),
                              Row(
                                children: [
                                  Image.asset(
                                    'assets/ic_event.png',
                                    width: 12,
                                    height: 12,
                                  ),
                                  SizedBox(width: 8),
                                  Flexible(
                                    child: Container(
                                      child: Text(
                                        '${DateFormat('dd-MMM yyyy').format(widget.data.startDate)} - ${DateFormat('dd-MMM yyyy').format(widget.data.endDate)}',
                                        style: GoogleFonts.roboto(
                                            color: Color.fromRGBO(
                                                100, 116, 139, 1),
                                            fontStyle: FontStyle.normal,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w400),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 5,
                              ),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Image.asset(
                                    'assets/map_pin.png',
                                    width: 12,
                                    height: 12,
                                  ),
                                  SizedBox(width: 8),
                                  Flexible(
                                    child: Container(
                                      width: 200,
                                      child: Text(
                                        '${widget.data.locationAddress}',
                                        overflow: TextOverflow.ellipsis,
                                        // Display ellipsis when text overflows
                                        maxLines: 2,
                                        style: GoogleFonts.roboto(
                                            color: Color.fromRGBO(
                                                100, 116, 139, 1),
                                            fontStyle: FontStyle.normal,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w400),
                                      ),
                                    ),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                      )
                    ]),
              ),
            ],
          ),
          Positioned(
            child: CustomBottomBar(Const.eventDetailsUI, handleCallback),
            bottom: 0,
            left: 0,
            right: 0,
          ),
          if (loader) Progressbar(loader)
        ],
      ),
    );
  }
}
