import 'dart:convert';
import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:com.urbaevent/model/ResponseConferenceIds.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/adapter_view/Conference.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';
import 'package:com.urbaevent/model/events/ResponseEventConferences.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomBottomBar.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

import 'MySchedule.dart';

class ConferenceList extends StatefulWidget {
  final int id;
  final bool isRegisteredForEvent;
  final String type;

  ConferenceList(this.id, this.isRegisteredForEvent, this.type);

  @override
  State<StatefulWidget> createState() => _Conferences();
}

class _Conferences extends State<ConferenceList> {
  ResponseEventConferences? responseEventConferences;
  ResponseConferenceIds? responseConferenceIds;

  bool loader = false;
  bool isInit = false;
  bool isRegisteredForConference = false;

  Future<void> _showConferenceInfoDialog(
      BuildContext context, Datum data) async {
    String availableSeats = " ";
    if (data.availableSeats != null) {
      availableSeats = data.availableSeats.toString();
    }

    return showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          insetPadding: EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20.0),
          ),
          child: Container(
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(Radius.circular(10))),
            padding: EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).pop();
                      },
                      child: SvgPicture.asset(
                        'assets/ic_close_clear_.svg',
                        width: 35,
                        height: 35,
                      ),
                    )
                  ],
                ),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10.0),
                  child: CachedNetworkImage(
                    imageUrl: Urls.imageURL + data.banner.url,
                    width: MediaQuery.of(context).size.width,
                    height: MediaQuery.of(context).size.width / 2,
                    fit: BoxFit.fitWidth,
                  ),
                ),
                SizedBox(
                  height: 20,
                ),
                Text(data.name,
                    style: GoogleFonts.roboto(
                        color: ThemeColor.textPrimary,
                        fontStyle: FontStyle.normal,
                        fontSize: 16,
                        fontWeight: FontWeight.w500),
                    textAlign: TextAlign.center),
                SizedBox(
                  height: 25,
                ),
                Row(
                  children: [
                    SizedBox(
                      width: 20,
                    ),
                    SvgPicture.asset('assets/ic_calender_conf.svg'),
                    SizedBox(
                      width: 10,
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          Intl.message("date", name: "date"),
                          textAlign: TextAlign.start,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.roboto(
                              color: ThemeColor.textSecondary,
                              fontStyle: FontStyle.normal,
                              fontSize: 12,
                              fontWeight: FontWeight.w400),
                        ),
                        Text(
                          DateFormat('dd MMM yyyy').format(data.date),
                          textAlign: TextAlign.start,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.roboto(
                              color: ThemeColor.textPrimary,
                              fontStyle: FontStyle.normal,
                              fontSize: 12,
                              fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                    SizedBox(
                      width: 30,
                    ),
                    SvgPicture.asset('assets/ic_time_conf.svg'),
                    SizedBox(
                      width: 10,
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          Intl.message("time", name: "time"),
                          textAlign: TextAlign.start,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.roboto(
                              color: ThemeColor.textSecondary,
                              fontStyle: FontStyle.normal,
                              fontSize: 12,
                              fontWeight: FontWeight.w400),
                        ),
                        Text(
                          '${data.startTime.substring(0, 5)} / ${data.endTime.substring(0, 5)}',
                          textAlign: TextAlign.start,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.roboto(
                              color: ThemeColor.textPrimary,
                              fontStyle: FontStyle.normal,
                              fontSize: 12,
                              fontWeight: FontWeight.w500),
                        ),
                      ],
                    )
                  ],
                ),
                SizedBox(
                  height: 10,
                ),
                Row(
                  children: [
                    SizedBox(
                      width: 20,
                    ),
                    Image.asset(
                      'assets/icon_venue.png',
                      width: 40,
                      height: 40,
                    ),
                    SizedBox(
                      width: 10,
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          Intl.message("venue", name: "venue"),
                          textAlign: TextAlign.start,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.roboto(
                              color: ThemeColor.textSecondary,
                              fontStyle: FontStyle.normal,
                              fontSize: 12,
                              fontWeight: FontWeight.w400),
                        ),
                        Container(
                          width: 50,
                          child: Text(
                            data.location,
                            textAlign: TextAlign.start,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.roboto(
                                color: ThemeColor.textPrimary,
                                fontStyle: FontStyle.normal,
                                fontSize: 12,
                                fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(
                      width: 50,
                    ),
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SvgPicture.asset(
                          'assets/ic_people_conf.svg',
                          width: 40,
                          height: 40,
                        ),
                        SvgPicture.asset(
                          'assets/ic_users.svg',
                          width: 18,
                          height: 18,
                        ),
                      ],
                    ),
                    SizedBox(
                      width: 10,
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          Intl.message("participants", name: "participants"),
                          textAlign: TextAlign.start,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.roboto(
                              color: ThemeColor.textSecondary,
                              fontStyle: FontStyle.normal,
                              fontSize: 12,
                              fontWeight: FontWeight.w400),
                        ),
                        Text(
                          availableSeats,
                          textAlign: TextAlign.start,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.roboto(
                              color: ThemeColor.textPrimary,
                              fontStyle: FontStyle.normal,
                              fontSize: 12,
                              fontWeight: FontWeight.w500),
                        ),
                      ],
                    )
                  ],
                ),
                SizedBox(
                  height: 30,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (widget.isRegisteredForEvent && data.isConfirmed == null)
                      Container(
                        width: 130,
                        height: 45,
                        child: TextButton(
                          onPressed: () async {
                            Navigator.of(context).pop();
                            registerForConference(data.id);
                          },
                          child: Text(
                            Intl.message("assist", name: "assist"),
                            style: GoogleFonts.roboto(
                                color: Colors.white,
                                fontStyle: FontStyle.normal,
                                fontSize: 12,
                                fontWeight: FontWeight.w400),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ThemeColor.colorAccent,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30.0),
                            ),
                          ),
                        ),
                      ),
                    if (widget.isRegisteredForEvent &&
                        data.isConfirmed != null &&
                        data.isConfirmed!)
                      Container(
                        height: 32,
                        child: Row(
                          children: [
                            Image.asset('assets/icon_tick.png',
                                height: 18, width: 18),
                            SizedBox(
                              width: 6,
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                SizedBox(
                  height: 20,
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> registerForConference(int id) async {
    setState(() {
      loader = true;
    });
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();

    if (jwtToken.isNotEmpty) {
      final url = Uri.parse(Urls.baseURL + Urls.registrations);

      final jsonData = {
        "data": {
          "user": preference.getLoginDetails()!.user.id,
          "event": widget.id,
          "conference": id,
          "type": widget.type,
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
        print('Response' + response.body);
        setState(() {
          Utils.showToast(
            Intl.message("msg_reg_conference", name: "msg_reg_conference"),
          );
          isRegisteredForConference = true;
          getConferencesList();
        });
      } else {
        print('Response Error' + response.body);
        final error = ResponseError.fromJson(parsedJson);
        Utils.showToast(error.error.message);
      }
    } else {
      Navigator.pop(context);
    }
    setState(() {
      loader = false;
    });
  }

  Future<void> getConferencesList() async {
    setState(() {
      loader = true;
    });

    final url = Uri.parse(Urls.baseURL +
        Urls.conferencesList +
        widget.id.toString() +
        Urls.conferencesListFilter);
    final response = await http.get(url);

    final parsedJson = jsonDecode(response.body);

    if (response.statusCode == HttpStatus.ok) {
      print('Response' + response.body);
      setState(() {
        responseEventConferences =
            ResponseEventConferences.fromJson(parsedJson);
      });
      if (isRegisteredForConference) {
        isRegisteredForConference = false;
        Navigator.push(
          context,
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) =>
                MySchedule(widget.id),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
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
    } else {
      print('Response Error' + response.body);
      final error = ResponseError.fromJson(parsedJson);
      Utils.showToast(error.error.message);
    }
    setState(() {
      getConferencesRegistrationList();
      loader = false;
    });
  }

  Future<void> getConferencesRegistrationList() async {
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();

    if (jwtToken.isNotEmpty) {
      setState(() {
        loader = true;
      });
      final url = Uri.parse(Urls.baseURL +
          Urls.conferenceRegistrationList +
          preference.getUserId().toString() +
          Urls.conferenceRegistrationListFilter +
          widget.id.toString());
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      final parsedJson = jsonDecode(response.body);

      if (response.statusCode == HttpStatus.ok) {
        print('Response' + response.body);
        setState(() {
          responseConferenceIds = ResponseConferenceIds.fromJson(parsedJson);
          if (responseConferenceIds!.data!.isNotEmpty) {
            for (int i = 0; i < responseEventConferences!.data.length; i++) {
              for (int j = 0; j < responseConferenceIds!.data!.length; j++) {
                if (responseEventConferences!.data[i].id ==
                    responseConferenceIds!.data![j].id!) {
                  responseEventConferences!.data[i].isConfirmed = true;
                  break;
                }
              }
            }
          }
        });
      } else {
        print('Response Error' + response.body);
        final error = ResponseError.fromJson(parsedJson);
        Utils.showToast(error.error.message);
      }
    }
    setState(() {
      isInit = true;
      loader = false;
    });
  }

  void onCallBack() {
    setState(() {
      Navigator.pop(context);
    });
  }

  void handleAttainCallback(int val, bool isView) {
    setState(() {
      if (isView) {
        _showConferenceInfoDialog(
          context,
          responseEventConferences!.data[val],
        );
      } else {
        registerForConference(responseEventConferences!.data[val].id);
      }
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

  @override
  void initState() {
    super.initState();
    // Set the initial status bar color to transparent
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
    ));

    getConferencesList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: null,
      body: Stack(
        children: [
          Container(color: Color.fromRGBO(249, 249, 255, 1)),
          Column(
            children: [
              CustomToolbar(Intl.message("conferences", name: "conferences"),
                  onCallBack, Utils.notificationCount, false),
              if (responseEventConferences != null &&
                  responseEventConferences!.data.length > 0 &&
                  isInit)
                Expanded(
                  flex: 1,
                  child: Container(
                    child: ListView.builder(
                      padding: EdgeInsets.all(0),
                      scrollDirection: Axis.vertical,
                      itemCount: responseEventConferences!.data.length,
                      itemBuilder: (context, index) {
                        return Conference(
                            index,
                            responseEventConferences!.data[index],
                            handleAttainCallback,
                            widget.isRegisteredForEvent);
                      },
                      // reverse: true,
                      physics: BouncingScrollPhysics(),
                    ),
                  ),
                ),
              if (responseEventConferences != null &&
                  responseEventConferences!.data.length == 0 &&
                  isInit)
                Expanded(
                  flex: 1,
                  child: Center(
                    child: Text(
                      Intl.message("no_conferences", name: "no_conferences"),
                      style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontStyle: FontStyle.normal,
                          fontSize: 12,
                          fontWeight: FontWeight.w400),
                    ),
                  ),
                ),
              if (responseEventConferences == null || isInit == false)
                Expanded(
                  flex: 1,
                  child: Container(),
                ),
              CustomBottomBar(-1, handleCallback)
            ],
          ),
          if (loader) Progressbar(loader)
        ],
      ),
    );
  }
}
