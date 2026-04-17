import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:com.urbaevent/model/agent/ResponseAgentAuth.dart';
import 'package:com.urbaevent/model/agent/ResponseGateList.dart';
import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/utils/QrScannerOverlayShape.dart';
import 'package:com.urbaevent/widgets/CustomBottomBarAgent.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';

import 'package:com.urbaevent/model/common/ResponseUser.dart';
import 'package:com.urbaevent/ui/auth/SignIn.dart';
import 'package:com.urbaevent/ui/content_ui/home/sub_views/Profile.dart';
import 'package:com.urbaevent/ui/content_ui/home/sub_views/ProfileInformation.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:com.urbaevent/utils/PageVisibilityObserver.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:com.urbaevent/widgets/HalfImageVisible.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';
import 'package:qr_mobile_vision/qr_camera.dart';
import 'package:vibration/vibration.dart';

import '../home/HomePage.dart';

class AgentHomePage extends StatefulWidget {
  final int setUIMode;

  AgentHomePage(this.setUIMode);

  @override
  State<StatefulWidget> createState() => _AgentHomePage();
}

class _AgentHomePage extends State<AgentHomePage> {
  bool isLoggedIn = false;
  int uiMode = 0;
  String scanResult = "";
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  String _displayText = '';
  TextEditingController textController = TextEditingController();
  bool loader = false;
  ResponseUser? _responseUser;
  ResponseAgentAuth? responseAgentAuth;
  ResponseGateList? responseGateList;

  bool getEventsInit = false;
  bool getEventsFailed = false;
  late PageVisibilityObserver _pageVisibilityObserver;
  bool _isVisible = true;
  int ebadgeItemPosition = -1;
  bool init = false;
  String? qr;
  bool camState = true;
  bool dirState = false;
  int _selectedIndex = -1; // Index of the selected item
  List<GateItem> gateList = [];
  final GlobalKey _anchorKey = GlobalKey();
  OverlayEntry? _overlayEntry;
  bool isExpanded = false;
  TextEditingController _textController = TextEditingController();
  String imageURL = "";

  Future<void> addUserToScan(List<String> strList) async {
    setState(() {
      loader = true;
    });
    try {
      await SupabaseService.instance.saveScan(
        scannedUserId: strList[2].toString(),
        salonId: strList[1].toString(),
      );
    } catch (e) {
      Utils.showToast(e.toString());
      Timer(Duration(seconds: 3), () {
        scanResult = "";
      });
    }
    setState(() {
      loader = false;
    });
  }

  void handleCallback(int val) {
    setState(() {
      loader = false;
      if (val == Const.homeUI) {
        getUserDetails();
      }
      if (isLoggedIn) {
        if (val == Const.profileUI) {
          getUserDetails();
        }
        if (val == Const.scanUI) {
          scanResult = "";
        }
        uiMode = val;
      } else {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => SignIn()),
        );
      }
    });
  }

  void handleProfileCallbacks(int val) {
    setState(() {
      switch (val) {
        case 0:
          break;

        case 1:
          String stringPicUrl = "";
          if (_responseUser!.avatar == null) {
            stringPicUrl = Urls.imageURL;
          } else {
            stringPicUrl = Urls.imageURL + _responseUser!.avatar!.url;
          }
          Navigator.push(
            context,
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) =>
                  ProfileInformation(
                      title: "",
                      isMine: true,
                      avatar: stringPicUrl,
                      name: _responseUser!.name,
                      company: _responseUser!.company,
                      businessIndustry: " ",
                      email: _responseUser!.email,
                      phoneNumber: _responseUser!.phone ?? " ",
                      isUser: false),
              transitionsBuilder:
                  (context, animation, secondaryAnimation, child) {
                const begin = Offset(1.0, 0.0); // Slide from right
                const end = Offset.zero;
                const curve = Curves.easeInOut;
                var tween = Tween(begin: begin, end: end)
                    .chain(CurveTween(curve: curve));
                var offsetAnimation = animation.drive(tween);
                return SlideTransition(position: offsetAnimation, child: child);
              },
            ),
          );
          break;

        case 3:
          _showLogoutDialog(context);
          break;
      }
    });
  }

  Future<String> getPreferenceValue() async {
    Preference prefs = await Preference.getInstance();
    // Replace 'preferenceKey' with your actual preference key
    if (prefs.getGateItem() != null) {
      return prefs.getGateItem()!.name!;
    } else {
      return ' ';
    }
  }

  void onBackCallBack() {
    setState(() {
      onBackOptions();
    });
  }

  void onBackOptions() {
    if (uiMode == Const.eBadgeDetailsUI) {
      uiMode = Const.eBadgesUI;
    } else {
      uiMode = Const.homeUI;
    }
  }

  Future<void> clearAppPreferences() async {
    Preference preference = await Preference.getInstance();
    preference.setToken("");
    preference.setUserId(0);
    preference.saveLogin(null);
  }

  Future<void> _showLogoutDialog(BuildContext context) async {
    return showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          surfaceTintColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          title: Text(
            Intl.message("logout", name: "logout"),
            style: GoogleFonts.roboto(
                color: Colors.black,
                fontStyle: FontStyle.normal,
                fontSize: 16,
                fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          content: Text(Intl.message("logout_msg", name: "logout_msg"),
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
                      clearAppPreferences();
                      isLoggedIn = false;
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                            builder: (context) => HomePage(Const.homeUI)),
                        (route) => false,
                      );
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

  Future<void> _showAnchoredDialog(
      BuildContext context, Offset anchorOffset) async {
    final OverlayState overlayState = Overlay.of(context);
    final Preference preference = await Preference.getInstance();

    _overlayEntry = OverlayEntry(
      builder: (BuildContext context) {
        return Stack(
          children: [
            GestureDetector(
              onTap: () {
                setState(() {
                  isExpanded = false;
                });
                _overlayEntry?.remove();
              },
              child: Container(
                color: Colors.transparent, // Background dim effect
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height,
              ),
            ),
            Positioned(
              right: 16,
              top: anchorOffset.dy + 50, // Adjust the offset as needed
              child: Card(
                  elevation: 2,
                  shadowColor:
                      Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.vertical(bottom: Radius.circular(10)),
                  ),
                  color: Colors.white,
                  child: Container(
                      width: 120,
                      height: 160,
                      child: ListView.builder(
                        padding: EdgeInsets.only(top: 10),
                        itemCount:
                            preference.getGateListResponse()!.data!.length,
                        itemBuilder: (BuildContext context, int index) {
                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                isExpanded = false;
                                _overlayEntry?.remove();
                                _selectedIndex = index;
                                _textController.text =
                                    gateList[_selectedIndex].name!;
                              });
                              setState(() async {
                                Preference preference =
                                    await Preference.getInstance();
                                preference.saveGate(gateList[_selectedIndex]);
                              });
                            },
                            child: Container(
                              height: 40.0,
                              width: 120,
                              color: _selectedIndex == index
                                  ? Color.fromRGBO(
                                      69, 152, 209, 0.15) // Highlighted color
                                  : Colors.transparent,
                              child: Align(
                                alignment: Alignment.centerLeft,
                                child: Padding(
                                  padding: EdgeInsets.only(left: 20, right: 20),
                                  child: Text(
                                    preference
                                        .getGateListResponse()!
                                        .data![index]
                                        .name!,
                                    maxLines: 1,
                                    style: GoogleFonts.roboto(
                                        color: ThemeColor.textPrimary,
                                        fontStyle: FontStyle.normal,
                                        fontSize: 18,
                                        fontWeight: FontWeight.w400),
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ))),
            ),
          ],
        );
      },
    );

    overlayState.insert(_overlayEntry!);
  }

  Future<void> getUserDetails() async {
    Preference preference = await Preference.getInstance();

    final uuid = preference.getUserUUID();

    if (uuid.isNotEmpty) {
      setState(() {
        isLoggedIn = true;
      });

      String os;
      final info = await PackageInfo.fromPlatform();
      if (Platform.isAndroid) {
        os = "android";
      } else {
        os = "ios";
      }

      FirebaseMessaging messaging = FirebaseMessaging.instance;
      String? fcmToken = await messaging.getToken();

      // Save push token via SupabaseService
      if (fcmToken != null) {
        await SupabaseService.instance.savePushToken(fcmToken, os);
      }

      try {
        final profile = await SupabaseService.instance.getUserProfile(uuid);
        if (profile != null) {
          setState(() {
            _responseUser = ResponseUser.fromJson(profile);
            getAuthRole();
          });
        }
      } catch (e) {
        debugPrint('getUserDetails error: $e');
      }
    } else {
      setState(() {
        isLoggedIn = false;
      });
    }
  }

  Future<void> getGateList() async {
    Preference preference = await Preference.getInstance();

    final uuid = preference.getUserUUID();

    if (uuid.isNotEmpty) {
      setState(() {
        loader = false;
      });

      try {
        final gates = await SupabaseService.instance
            .getGates(responseAgentAuth!.eventControl!.id!.toString());

        setState(() {
          loader = false;
          responseGateList = ResponseGateList(
              data: gates.map((g) => GateItem.fromJson(g)).toList());
          preference.setGateListResponse(responseGateList);
          if (preference.getGateItem() == null) {
            preference.saveGate(responseGateList!.data![0]);
          }
          gateList = responseGateList!.data!;
          if (preference.getGateItem() != null) {
            for (int i = 0; i < gateList.length; i++) {
              if (preference.getGateItem()!.name! == gateList[i].name!) {
                _selectedIndex = i;
                _textController.text = gateList[_selectedIndex].name!;
              }
            }
          }

          init = true;
        });
      } catch (e) {
        debugPrint('getGateList error: $e');
      }
    } else {
      setState(() {
        loader = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _pageVisibilityObserver =
        PageVisibilityObserver(_handlePageVisibilityChange);
    WidgetsBinding.instance.addObserver(_pageVisibilityObserver);
    uiMode = widget.setUIMode;
    textController.addListener(_handleTextChange);
    getUserDetails();
  }

  Future<void> getAuthRole() async {
    Preference preference = await Preference.getInstance();

    final uuid = preference.getUserUUID();

    if (uuid.isNotEmpty) {
      setState(() {
        loader = true;
      });

      try {
        final authData = await SupabaseService.instance.getAgentAuth();

        if (authData != null) {
          preference.saveAuthRoleAgent(ResponseAgentAuth.fromJson(authData));
          responseAgentAuth = preference.getAuthRoleAgent();

          if (responseAgentAuth!.eventControl != null &&
              responseAgentAuth!.eventControl!.banner != null) {
            imageURL =
                responseAgentAuth!.eventControl!.banner!.url;
          } else {
            imageURL = Urls.imageURL;
          }
        }
      } catch (e) {
        debugPrint('getAuthRole error: $e');
      }
      setState(() {
        getGateList();
        loader = false;
      });
    } else {
      setState(() {
        loader = false;
      });
    }
  }

  void _handlePageVisibilityChange(bool isVisible) {
    setState(() {
      _isVisible = isVisible;
      if (_isVisible) {
        print('onResume');
      } else {
        print('onPause');
      }
    });
  }

  void _handleTextChange() {
    setState(() {
      _displayText = textController.text;
      if (_displayText.isNotEmpty) {
        uiMode = Const.searchEventUI;
      } else {
        uiMode = Const.homeUI;
      }
    });
  }

  @override
  void dispose() {
    textController.removeListener(_handleTextChange);
    textController.dispose();
    WidgetsBinding.instance.removeObserver(_pageVisibilityObserver);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SIB',
      home: _buildHomeContent(),
    );
  }

  Widget _buildHomeContent() {
    Future<bool> _onBackPressedOveRiding() async {
      if (uiMode == Const.homeUI) {
        return true;
      } else {
        setState(() {
          onBackOptions();
        });
      }
      return false;
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, _) {
        if (!didPop) _onBackPressedOveRiding();
      },
      child: Scaffold(
          resizeToAvoidBottomInset: false,
          body: Stack(
            children: [
              Container(color: ThemeColor.bgColor),
              if (uiMode == Const.homeUI) HalfImageVisible(),
              Column(
                children: [
                  //Toolbar
                  if (uiMode == Const.homeUI)
                    SizedBox(
                      height: 40,
                    ),
                  if (uiMode == Const.homeUI)
                    Center(
                      child: Image.asset(
                        'assets/app_logo.png',
                        width: 110,
                        height: 70,
                      ),
                    ),
                  if (uiMode == Const.scanUI)
                    Container(
                      child: Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.start,
                          // Align the first item to the center start
                          crossAxisAlignment: CrossAxisAlignment.center,
                          // Vertically center both items
                          children: [
                            Container(
                                padding: EdgeInsets.only(
                                    left: 16.0, right: 16, top: 24),
                                child: Image.asset(
                                  'assets/app_logo.png',
                                  width: 110,
                                  height: 70,
                                )),
                            Spacer(),
                            // Add a spacer to push the next item to the right
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                  final RenderBox renderBox = _anchorKey
                                      .currentContext!
                                      .findRenderObject() as RenderBox;
                                  final anchorPosition =
                                      renderBox.localToGlobal(Offset.zero);
                                  _showAnchoredDialog(context, anchorPosition);
                                  isExpanded = true;
                                });
                              },
                              child: Container(
                                key: _anchorKey,
                                height: 70,
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  children: [
                                    SizedBox(
                                      width: 16,
                                    ),
                                    Container(
                                      child: Center(
                                        child: Stack(
                                          alignment: Alignment.center,
                                          children: [
                                            Image.asset(
                                              "assets/icon_hall_small.png",
                                              height: 24,
                                              width: 24,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                    SizedBox(width: 10),
                                    if (_selectedIndex != -1)
                                      Container(
                                        width: 80,
                                        child: Text(
                                          _textController.text,
                                          maxLines: 1,
                                          style: GoogleFonts.roboto(
                                              color: ThemeColor.textPrimary,
                                              fontStyle: FontStyle.normal,
                                              fontSize: 16,
                                              fontWeight: FontWeight.w400),
                                        ),
                                      ),
                                    Image.asset('assets/ic_down.png'),
                                    SizedBox(width: 20),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (uiMode == Const.profileUI)
                    CustomToolbar(Intl.message("profile", name: "profile"),
                        onBackCallBack, -1, false),

                  // Middle Section
                  if (uiMode == Const.homeUI && responseAgentAuth != null)
                    Expanded(
                      child: Container(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                                borderRadius: BorderRadius.circular(32),
                                // Set the border radius here
                                child: CachedNetworkImage(
                                  fit: BoxFit.fill,
                                  height: 300,
                                  width: MediaQuery.of(context).size.width,
                                  imageUrl: imageURL,
                                  // Replace with your image URL
                                  placeholder: (context, url) => Container(
                                      alignment: Alignment.center,
                                      height: 100,
                                      child: Center(
                                          child: CircularProgressIndicator(
                                        color: Colors.black.withValues(alpha: 0.2),
                                      ))),
                                )),
                            Expanded(
                              child: SingleChildScrollView(
                                child: Padding(
                                  padding: const EdgeInsets.only(
                                      top: 60, left: 30, right: 30, bottom: 30),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Text(
                                        responseAgentAuth!.eventControl!.name ??
                                            " ",
                                        textAlign: TextAlign.start,
                                        style: GoogleFonts.roboto(
                                            color: ThemeColor.textPrimary,
                                            fontStyle: FontStyle.normal,
                                            fontSize: 24,
                                            fontWeight: FontWeight.w500),
                                      ),
                                      SizedBox(
                                        height: 8,
                                      ),
                                      Row(
                                        children: [
                                          Row(
                                            children: [
                                              Image.asset(
                                                'assets/icon_location.png',
                                                width: 16,
                                                height: 16,
                                              ),
                                              SizedBox(width: 5),
                                              Container(
                                                width: 280,
                                                child: Text(
                                                  responseAgentAuth!
                                                      .eventControl!
                                                      .locationAddress!,
                                                  maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: GoogleFonts.roboto(
                                                      color: Color.fromRGBO(
                                                          100, 116, 139, 1),
                                                      fontStyle:
                                                          FontStyle.normal,
                                                      fontSize: 16,
                                                      fontWeight:
                                                          FontWeight.w400),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      SizedBox(
                                        height: 8,
                                      ),
                                      Html(
                                          data: responseAgentAuth!
                                              .eventControl!.fullDescription!),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (uiMode == Const.homeUI && responseAgentAuth == null)
                    Expanded(flex: 1, child: Container()),
                  if (uiMode == Const.scanUI)
                    Expanded(flex: 4, child: _scanner()),
                  if (uiMode == Const.profileUI && _responseUser != null)
                    Profile('try', "", handleProfileCallbacks, _responseUser!),
                  if (uiMode == Const.profileUI && _responseUser == null)
                    Expanded(flex: 1, child: Container()),
                  // Bottom Section
                  CustomBottomBarAgent(uiMode, handleCallback)
                ],
              ),
              if (uiMode == Const.homeUI &&
                  responseAgentAuth != null &&
                  responseGateList != null &&
                  init)
                Column(
                  children: [
                    SizedBox(
                      height: 360,
                    ),
                    Center(
                      child: Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15.0),
                        ),
                        color: ThemeColor.colorAccent,
                        child: Container(
                          width: 265,
                          height: 90,
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                SizedBox(
                                  height: 8,
                                ),
                                Center(
                                  child: Container(
                                    child: Stack(
                                      alignment: Alignment.center,
                                      children: [
                                        Center(
                                          child: Container(
                                            width: 100,
                                            height: 24,
                                            decoration: BoxDecoration(
                                              color: ThemeColor.themeOrange,
                                              borderRadius:
                                                  BorderRadius.circular(20),
                                            ),
                                          ),
                                        ),
                                        Text(
                                          DateFormat('dd').format(
                                                  responseAgentAuth!
                                                      .eventControl!
                                                      .startDate!) +
                                              "-" +
                                              DateFormat('dd MMM, yyyy').format(
                                                  responseAgentAuth!
                                                      .eventControl!.endDate!),
                                          style: GoogleFonts.roboto(
                                              color: Colors.white,
                                              fontStyle: FontStyle.normal,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w500),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                SizedBox(
                                  height: 8,
                                ),
                                Padding(
                                  padding: const EdgeInsets.only(
                                      left: 20, right: 20),
                                  child: Divider(
                                    color: Colors.white,
                                    thickness: 1,
                                  ),
                                ),
                                Center(
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Image.asset(
                                        'assets/icon_booth.png',
                                        width: 24,
                                        height: 24,
                                      ),
                                      SizedBox(
                                        width: 12,
                                      ),
                                      FutureBuilder<String>(
                                        future: getPreferenceValue(),
                                        builder: (context, snapshot) {
                                          if (snapshot.connectionState ==
                                              ConnectionState.waiting) {
                                            return Text(
                                              ' ',
                                              style: GoogleFonts.roboto(
                                                  color: Colors.white,
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 20,
                                                  fontWeight: FontWeight.w700),
                                            );
                                          } else if (snapshot.hasError) {
                                            return Text(
                                                'Error: ${snapshot.error}');
                                          } else {
                                            String text = snapshot.data ??
                                                ''; // Use a default value if the data is null
                                            return Text(
                                              text,
                                              style: GoogleFonts.roboto(
                                                  color: Colors.white,
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.w700),
                                            );
                                          }
                                        },
                                      )
                                    ],
                                  ),
                                )
                              ]),
                        ),
                      ),
                    ),
                  ],
                ),
              if (loader) Progressbar(loader),
            ],
          )),
    );
  }

  Future<void> vibrateOnce() async {
    final available = await Vibration.hasVibrator();
    if (available == true) {
      Vibration.vibrate(duration: 500);
    }
  }

  Widget _scanner() {
    return Center(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Expanded(
              child: camState
                  ? Stack(
                      children: [
                        Center(
                          child: QrCamera(
                            onError: (context, error) => Text(
                              error.toString(),
                              style: TextStyle(color: Colors.red),
                            ),
                            cameraDirection: CameraDirection.BACK,
                            qrCodeCallback: (code) {
                              if(uiMode==Const.scanUI){
                                setState(() {
                                  if (scanResult != code) {
                                    scanResult = code!;
                                    try {
                                      vibrateOnce();
                                      List<String> strResult =
                                      scanResult.split("-");
                                      if (strResult.length > 2) {
                                        addUserToScan(strResult);
                                      } else {
                                        Utils.showToast(Intl.message(
                                            "msg_scan_correct_ebadge",
                                            name: "msg_scan_correct_ebadge"));
                                      }
                                    } catch (e) {
                                      print(e);
                                    }
                                  }
                                });
                              }

                            },
                          ),
                        ),
                        Container(
                          decoration: ShapeDecoration(
                              shape: QrScannerOverlayShape(
                                  borderColor: Colors.green,
                                  borderRadius: 10,
                                  borderLength: 30,
                                  borderWidth: 10,
                                  cutOutSize: 300)),
                        ),
                      ],
                    )
                  : Center(child: Text("Camera inactive"))),
        ],
      ),
    );
  }
}
