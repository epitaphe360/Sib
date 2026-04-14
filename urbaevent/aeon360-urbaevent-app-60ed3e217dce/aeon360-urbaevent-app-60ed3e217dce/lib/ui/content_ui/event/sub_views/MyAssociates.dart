import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:com.urbaevent/utils/Const.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/adapter_view/Associate.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/model/AssociateInfo.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';
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
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';

class MyAssociates extends StatefulWidget {
  MyAssociates();

  @override
  State<StatefulWidget> createState() => _MyAssociates();
}

class _MyAssociates extends State<MyAssociates> {
  List<AssociateInfo>? associateList;
  OverlayEntry? _overlayEntry;
  bool loader = false;
  int editPosition = -1;

  TextEditingController _namePController = TextEditingController();
  TextEditingController _functionController = TextEditingController();
  TextEditingController _emailController = TextEditingController();
  TextEditingController _phoneNumberController = TextEditingController();

  Future<void> _showDialog(BuildContext context, int index) async {
    return showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          title: Text(
            Intl.message("delete", name: "delete"),
            style: GoogleFonts.roboto(
                color: Colors.black,
                fontStyle: FontStyle.normal,
                fontSize: 16,
                fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          content: Text(
              Intl.message("msg_delete_collaborator",
                  name: "msg_delete_collaborator"),
              style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontStyle: FontStyle.normal,
                  fontSize: 16,
                  fontWeight: FontWeight.w400),
              textAlign: TextAlign.center),
          actions: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextButton(
                  onPressed: () async {
                    Navigator.of(context).pop();
                  },
                  child: Text(
                    Intl.message("cancel", name: "cancel"),
                    style: GoogleFonts.roboto(
                        color: Colors.white,
                        fontStyle: FontStyle.normal,
                        fontSize: 12,
                        fontWeight: FontWeight.w400),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color.fromRGBO(217, 217, 217, 1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30.0),
                    ),
                  ),
                ),
                SizedBox(
                  width: 25,
                ),
                TextButton(
                  onPressed: () async {
                    Navigator.of(context).pop();
                    setState(() {
                      deleteCollaborator(index);
                    });
                  },
                  child: Text(
                    Intl.message("yes", name: "yes"),
                    style: GoogleFonts.roboto(
                        color: Colors.white,
                        fontStyle: FontStyle.normal,
                        fontSize: 12,
                        fontWeight: FontWeight.w400),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ThemeColor.themeOrange,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30.0),
                    ),
                  ),
                ),
              ],
            )
          ],
        );
      },
    );
  }

  void _showAddAssociateDialog(bool isAdd) {
    FocusNode focusNodeFunctions = FocusNode();
    FocusNode focusNodeEmail = FocusNode();
    FocusNode focusNodePhone = FocusNode();

    bool checkValidations() {
      return true;
    }

    String generatePassword() {
      final random = Random();
      final characters =
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

      String generatedPassword = '';

      for (int i = 0; i < 6; i++) {
        final index = random.nextInt(characters.length);
        generatedPassword += characters[index];
      }

      print('generated password: $generatedPassword');

      return generatedPassword;
    }

    Future<void> addAssociate() async {
      setState(() {
        loader = true;
      });
      Preference preference = await Preference.getInstance();

      final jwtToken = preference.getToken();
      final url = Uri.parse(Urls.baseURL + Urls.users);

      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $jwtToken',
        },
        body: {
          'event': Const.eventID.toString(),
          'exhibitor': preference.getLoginDetails()!.user.id.toString(),
          'name': _namePController.value.text,
          'jobPosition': _functionController.value.text,
          'email': _emailController.value.text,
          'username': _emailController.value.text,
          'phone': _phoneNumberController.value.text,
          'confirmed': true.toString(),
          'password': generatePassword(),
          'type': 'collaborator',
          'lang': 'french',
          'role': 1.toString(),
          'emailOTPConfirmed': true.toString()
        },
      );

      final parsedJson = jsonDecode(response.body);

      print(response.statusCode.toString() + "" + response.body);

      if (response.statusCode == HttpStatus.ok) {
        Utils.showToast(
            Intl.message("msg_associate_added", name: "msg_associate_added"));
        getAssociateList();
        Navigator.pop(context);
      } else {
        final error = ResponseError.fromJson(parsedJson);
        Utils.showToast(error.error.message);
      }
      setState(() {
        loader = false;
      });
    }

    String buttonCTAText = "";

    if (isAdd) {
      buttonCTAText = Intl.message("save", name: "save");
    } else {
      buttonCTAText = Intl.message("update", name: "update");
    }

    showModalBottomSheet(
        context: context,
        barrierColor: Colors.transparent,
        isScrollControlled: true,
        backgroundColor: Color.fromRGBO(235, 154, 68, 1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
        ),
        // Set the custom shape here
        builder: (BuildContext context) {
          return SingleChildScrollView(
            child: Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context)
                    .viewInsets
                    .bottom, // Push up when keyboard opens
              ),
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Center(
                        child: Image.asset(
                      'assets/ic_top_line.png',
                      width: 135,
                      height: 5,
                      // Replace with the actual image URL
                      fit: BoxFit.contain,
                    )),
                  ),
                  SizedBox(
                    height: 30,
                  ),
                  SizedBox(
                    height: 52,
                    width: 330,
                    child: TextFormField(
                      controller: _namePController,
                      onEditingComplete: () {
                        focusNodeFunctions.requestFocus();
                      },
                      style: GoogleFonts.roboto(
                          fontSize: 18.0,
                          fontWeight: FontWeight.w400,
                          color: Colors.black),
                      decoration: InputDecoration(
                        hintStyle: TextStyle(
                            color: Color.fromRGBO(
                                132, 130, 130, 0.8745098039215686)),
                        labelText: Intl.message("name", name: "name"),
                        border: OutlineInputBorder(
                          borderSide: BorderSide.none,
                          borderRadius: BorderRadius.circular(25.0),
                        ),
                        filled: true,
                        fillColor: Color.fromRGBO(249, 249, 255, 1),
                        floatingLabelBehavior: FloatingLabelBehavior.never,
                        contentPadding: EdgeInsets.symmetric(horizontal: 20),
                      ),
                    ),
                  ),
                  SizedBox(height: 16.0),
                  SizedBox(
                    height: 52,
                    width: 330,
                    child: TextFormField(
                      focusNode: focusNodeFunctions,
                      controller: _functionController,
                      onEditingComplete: () {
                        focusNodeEmail.requestFocus();
                      },
                      style: GoogleFonts.roboto(
                          fontSize: 18.0,
                          fontWeight: FontWeight.w400,
                          color: Colors.black),
                      decoration: InputDecoration(
                        hintStyle: TextStyle(
                            color: Color.fromRGBO(
                                132, 130, 130, 0.8745098039215686)),
                        labelText: Intl.message("function", name: "function"),
                        border: OutlineInputBorder(
                          borderSide: BorderSide.none,
                          borderRadius: BorderRadius.circular(25.0),
                        ),
                        filled: true,
                        fillColor: Color.fromRGBO(249, 249, 255, 1),
                        floatingLabelBehavior: FloatingLabelBehavior.never,
                        contentPadding: EdgeInsets.symmetric(horizontal: 20),
                      ),
                    ),
                  ),
                  SizedBox(height: 16.0),
                  SizedBox(
                    height: 52,
                    width: 330,
                    child: TextFormField(
                      focusNode: focusNodeEmail,
                      controller: _emailController,
                      onEditingComplete: () {
                        focusNodePhone.requestFocus();
                      },
                      style: GoogleFonts.roboto(
                          fontSize: 18.0,
                          fontWeight: FontWeight.w400,
                          color: Colors.black),
                      decoration: InputDecoration(
                        labelText: Intl.message("email", name: "email"),
                        hintStyle: TextStyle(
                            color: Color.fromRGBO(
                                132, 130, 130, 0.8745098039215686)),
                        border: OutlineInputBorder(
                          borderSide: BorderSide.none,
                          borderRadius: BorderRadius.circular(25.0),
                        ),
                        filled: true,
                        contentPadding: EdgeInsets.symmetric(horizontal: 20),
                        fillColor: Color.fromRGBO(249, 249, 255, 1),
                        floatingLabelBehavior: FloatingLabelBehavior.never,
                      ),
                    ),
                  ),
                  SizedBox(height: 16.0),
                  SizedBox(
                    height: 52,
                    width: 330,
                    child: TextFormField(
                      focusNode: focusNodePhone,
                      controller: _phoneNumberController,
                      onEditingComplete: () {
                        if (checkValidations()) {
                          if (isAdd) {
                            addAssociate();
                          } else {
                            editCollaborator(editPosition);
                          }
                        }
                      },
                      style: GoogleFonts.roboto(
                          fontSize: 18.0,
                          fontWeight: FontWeight.w400,
                          color: Colors.black),
                      decoration: InputDecoration(
                        labelText:
                            Intl.message("phone_number", name: "phone_number"),
                        hintStyle: TextStyle(
                            color: Color.fromRGBO(
                                132, 130, 130, 0.8745098039215686)),
                        border: OutlineInputBorder(
                          borderSide: BorderSide.none,
                          borderRadius: BorderRadius.circular(25.0),
                        ),
                        filled: true,
                        contentPadding: EdgeInsets.symmetric(horizontal: 20),
                        fillColor: Color.fromRGBO(249, 249, 255, 1),
                        floatingLabelBehavior: FloatingLabelBehavior.never,
                      ),
                    ),
                  ),
                  SizedBox(height: 32.0),
                  Center(
                      child: TextButton(
                          style: TextButton.styleFrom(
                            fixedSize: Size(330, 50),
                            backgroundColor: Colors.white,
                            // Set the background color to black
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(
                                  25.0), // Set the border radius
                            ),
                          ),
                          onPressed: () async {
                            if (checkValidations()) {
                              if (isAdd) {
                                addAssociate();
                              } else {
                                editCollaborator(editPosition);
                              }
                            }
                          },
                          child: Text(buttonCTAText,
                              style: GoogleFonts.roboto(
                                  color: Color.fromRGBO(69, 152, 209, 1),
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700)))),
                  SizedBox(
                    height: 30,
                  )
                ],
              ),
            ),
          );
        });
  }

  void callback(int action, int index, double dx, double dy) {
    if (action == 0) {
      _showAnchoredDialog(context, associateList![index], index, dx, dy);
    } else if (action == 1) {
      sendEmailInvite(associateList![index].id!);
    } else if (action == 2) {
      if (associateList![index].registrations!.isNotEmpty) {
        requestPermission(associateList![index].registrations![0].id!);
      }
    }
  }

  Future<void> editCollaborator(int index) async {
    setState(() {
      loader = true;
    });
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();

    if (jwtToken.isNotEmpty) {
      final url = Uri.parse(Urls.baseURL +
          Urls.contactDetails +
          associateList![index].id!.toString());
      final response = await http.put(url, headers: {
        'Authorization': 'Bearer $jwtToken',
      }, body: {
        "name": _namePController.text.toString(),
        "email": _emailController.text.toString(),
        "username": _emailController.text.toString(),
        "phone": _phoneNumberController.text.toString(),
        "jobPosition": _functionController.text.toString(),
      });

      final parsedJson = jsonDecode(response.body);

      if (response.statusCode == HttpStatus.ok) {
        Utils.showToast(Intl.message("msg_associate_updated",
            name: "msg_associate_updated"));
        print('Response' + response.body);
        Navigator.pop(context);
        getAssociateList();
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

  Future<void> deleteCollaborator(int index) async {
    setState(() {
      loader = true;
    });
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();

    if (jwtToken.isNotEmpty) {
      final url = Uri.parse(Urls.baseURL +
          Urls.contactDetails +
          associateList![index].id!.toString());
      final response = await http.put(url, headers: {
        'Authorization': 'Bearer $jwtToken',
      }, body: {
        "blocked": true.toString(),
        "confirmed": false.toString()
      });

      final parsedJson = jsonDecode(response.body);

      if (response.statusCode == HttpStatus.ok) {
        Utils.showToast(Intl.message("msg_associate_deleted",
            name: "msg_associate_deleted"));
        print('Response' + response.body);
        setState(() {
          setState(() {
            associateList!.removeAt(index);
          });
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

  Future<void> getAssociateList() async {
    setState(() {
      loader = true;
    });
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();

    if (jwtToken.isNotEmpty) {
      final url = Uri.parse(Urls.baseURL +
          Urls.getAssociateList +
          preference.getUserId().toString() +
          Urls.getAssociateListFilter +
          Const.eventID.toString());
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      print('URL Collaborator' + url.toString());

      final parsedJson = jsonDecode(response.body);

      if (response.statusCode == HttpStatus.ok) {
        print('Response Collaborator List' + response.body);
        setState(() {
          final List<dynamic> jsonResponse = json.decode(response.body);
          associateList =
              jsonResponse.map((data) => AssociateInfo.fromJson(data)).toList();
          for (int i = 0; i < associateList!.length; i++) {
            if (associateList![i].blocked!) {
              associateList!.removeAt(i);
            }
          }
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

  Future<void> _downloadFile(int registrationId) async {
    try {
      setState(() {
        loader = true;
      });
      Preference preference = await Preference.getInstance();

      final jwtToken = preference.getToken();

      final url = Uri.parse(
          Urls.baseURL + Urls.downloadEbadge + registrationId.toString());
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      if (response.statusCode == 200) {
        // Get the application's document directory
        final appDir = await getApplicationCacheDirectory();
        final filePath = appDir.path + '/' + "Ebadge" + '.pdf';

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

  Future<void> requestPermission(int registrationId) async {
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
      _downloadFile(registrationId);
    } else if (status.isDenied) {
      // Permission is denied
      print('Permission denied');
    } else if (status.isPermanentlyDenied) {
      // Permission is permanently denied, show a user-friendly dialog
      print('Permission permanently denied');
      openAppSettings(); // Open the app settings to allow the user to grant permission manually
    }
  }

  Future<void> sendEmailInvite(int id) async {
    setState(() {
      loader = true;
    });
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();
    final url =
        Uri.parse(Urls.baseURL + Urls.sendAssociateEmailInvite + id.toString());

    print("Url: " + url.toString());

    final response = await http.post(url, headers: {
      'Authorization': 'Bearer $jwtToken',
    }, body: {});

    print(response.statusCode.toString() + " " + response.body);

    final parsedJson = jsonDecode(response.body);

    if (response.statusCode == HttpStatus.ok) {
    } else {
      final error = ResponseError.fromJson(parsedJson);
      Utils.showToast(error.error.message);
    }
    setState(() {
      loader = false;
    });
  }

  void _showAnchoredDialog(BuildContext context, AssociateInfo associateInfo,
      int index, double dx, double dy) {
    final OverlayState overlayState = Overlay.of(context);

    _overlayEntry = OverlayEntry(
      builder: (BuildContext context) {
        return Stack(
          children: [
            GestureDetector(
              onTap: () {
                _overlayEntry?.remove();
              },
              child: Container(
                color: Colors.black.withOpacity(0.12), // Background dim effect
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height,
              ),
            ),
            Positioned(
              top: dy,
              left: MediaQuery.of(context).size.width - 170,
              child: Card(
                elevation: 2,
                shadowColor: Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
                color: Colors.white,
                child: Container(
                    width: 110,
                    height: 54,
                    padding:
                        EdgeInsets.only(left: 13, right: 13, top: 4, bottom: 4),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        GestureDetector(
                          onTap: () {
                            editPosition = index;
                            _namePController.text = associateList![index].name!;
                            _functionController.text =
                                associateList![index].jobPosition!;
                            _emailController.text =
                                associateList![index].email!;
                            _phoneNumberController.text =
                                associateList![index].phone!;
                            if (_overlayEntry != null) {
                              _overlayEntry!.remove();
                            }
                            _showAddAssociateDialog(false);
                          },
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              SvgPicture.asset('assets/ic_edit.svg'),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                Intl.message("edit", name: "edit"),
                                style: GoogleFonts.roboto(
                                    color: ThemeColor.textPrimary,
                                    fontStyle: FontStyle.normal,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(
                          height: 5,
                        ),
                        GestureDetector(
                          onTap: () {
                            _overlayEntry!.remove();
                            _showDialog(context, index);
                          },
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              SvgPicture.asset('assets/ic_delete.svg'),
                              SizedBox(
                                width: 5,
                              ),
                              Text(
                                Intl.message("delete", name: "delete"),
                                style: GoogleFonts.roboto(
                                    color: ThemeColor.textPrimary,
                                    fontStyle: FontStyle.normal,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                        )
                      ],
                    )),
              ),
            ),
          ],
        );
      },
    );

    overlayState.insert(_overlayEntry!);
  }

  @override
  void initState() {
    super.initState();
    // Set the initial status bar color to transparent
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
    ));

    getAssociateList();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (_overlayEntry != null && _overlayEntry!.mounted) {
          _overlayEntry!.remove();
          return false;
        } else {
          return true;
        }
      },
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: null,
        body: Stack(
          children: [
            Container(color: Color.fromRGBO(249, 249, 255, 1)),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                CustomToolbar(
                    Intl.message("my_associates", name: "my_associates"),
                    onCallBack,
                    Utils.notificationCount,
                    false),
                SizedBox(
                  height: 30,
                ),
                GestureDetector(
                  onTap: () async {
                    _showAddAssociateDialog(true);
                  },
                  child: Padding(
                    padding: const EdgeInsets.only(right: 20),
                    child: Text(
                      Intl.message("add", name: "add"),
                      textAlign: TextAlign.end,
                      style: GoogleFonts.roboto(
                          fontSize: 16,
                          decoration: TextDecoration.none,
                          fontWeight: FontWeight.w700,
                          color: ThemeColor.themeOrange),
                    ),
                  ),
                ),
                if (associateList != null && associateList!.length > 0)
                  Expanded(
                    flex: 1,
                    child: Container(
                      child: ListView.builder(
                        padding: EdgeInsets.all(0),
                        scrollDirection: Axis.vertical,
                        itemCount: associateList!.length,
                        itemBuilder: (context, index) {
                          return Associate(
                              index, associateList![index], callback);
                        },
                        // reverse: true,
                        physics: BouncingScrollPhysics(),
                      ),
                    ),
                  ),
                if (associateList != null && associateList!.length == 0)
                  Expanded(
                    flex: 1,
                    child: Center(
                      child: Text(
                        Intl.message("no_associates", name: "no_associates"),
                        style: GoogleFonts.roboto(
                            color: Colors.black,
                            fontStyle: FontStyle.normal,
                            fontSize: 12,
                            fontWeight: FontWeight.w400),
                      ),
                    ),
                  ),
                if (associateList == null)
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
      ),
    );
  }
}
