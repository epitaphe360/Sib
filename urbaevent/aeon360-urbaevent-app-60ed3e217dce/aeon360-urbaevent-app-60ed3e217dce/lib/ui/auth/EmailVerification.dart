import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';
import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/ui/auth/RegistrationDone.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class EmailVerification extends StatefulWidget {
  final String otp;

  EmailVerification(this.otp);

  @override
  State<StatefulWidget> createState() => _EmailVerification();
}

class _EmailVerification extends State<EmailVerification> {
  bool loader = false;
  Color filledColor = Colors.white;
  Color unfilledColor = Color.fromRGBO(249, 249, 255, 0.7843137254901961);
  final int otpLength = 4; // The length of the OTP
  final List<TextEditingController> controllers =
      List.generate(4, (_) => TextEditingController());

  final List<FocusNode> focusNode = List.generate(4, (_) => FocusNode());

  String email = "";

  bool isTimerStarted = false;

  Timer? timer;
  late Duration countdownDuration;

  Future<void> getEmailString() async {
    Preference preference = await Preference.getInstance();
    if (!mounted) return;
    final loginDetails = preference.getLoginDetails();
    if (loginDetails == null) return;
    setState(() {
      email = Utils.obfuscateEmail(loginDetails.user.email);
    });
  }

  String formatDuration(Duration duration) {
    return '${duration.inMinutes.toString().padLeft(2, '0')}:${(duration.inSeconds % 60).toString().padLeft(2, '0')}';
  }

  Future<void> resentOTP() async {
    setState(() {
      loader = true;
    });

    try {
      Preference preference = await Preference.getInstance();
      final loginDetails = preference.getLoginDetails();
      if (loginDetails == null) {
        throw Exception('Session expirée');
      }
      await SupabaseService.instance
          .resendEmailOTP(loginDetails.user.email);
    } catch (e) {
      Utils.showToast(e.toString());
      if (mounted) {
        setState(() {
          isTimerStarted = false;
          timer?.cancel();
        });
      }
    }
    if (mounted) {
      setState(() {
        loader = false;
      });
    }
  }

  Future<void> verifyEmailOTP() async {
    setState(() {
      loader = true;
    });

    try {
      Preference preference = await Preference.getInstance();
      final loginDetails = preference.getLoginDetails();
      if (loginDetails == null) {
        throw Exception('Session expirée');
      }
      final otp = controllers[0].text +
          controllers[1].text +
          controllers[2].text +
          controllers[3].text;

      final success = await SupabaseService.instance.verifyEmailOTP(
        loginDetails.user.email,
        otp,
      );

      if (!mounted) return;
      if (success) {
        Navigator.push(
          context,
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) =>
                RegistrationDone(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
              const begin = Offset(1.0, 0.0);
              const end = Offset.zero;
              const curve = Curves.easeInOut;
              var tween =
                  Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
              var offsetAnimation = animation.drive(tween);
              return SlideTransition(position: offsetAnimation, child: child);
            },
          ),
        );
      } else {
        Utils.showToast(Intl.message("invalid_otp", name: "invalid_otp"));
      }
    } catch (e) {
      Utils.showToast(e.toString());
    }
    if (mounted) {
      setState(() {
        loader = false;
      });
    }
  }

  void handleCallback() {
    exit(0);
  }

  void startTimer() {
    timer = Timer.periodic(Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() {
        if (countdownDuration.inSeconds > 0) {
          countdownDuration -= Duration(seconds: 1);
        } else {
          isTimerStarted = false;
          t.cancel();
        }
      });
    });
  }

  @override
  void initState() {
    super.initState();
    getEmailString();
    countdownDuration = Duration(minutes: 1);
  }

  @override
  void dispose() {
    timer?.cancel();
    for (final c in controllers) {
      c.dispose();
    }
    for (final f in focusNode) {
      f.dispose();
    }
    super.dispose();
  }

  InputDecoration buildOtpInputDecoration(bool isFilled) {
    return InputDecoration(
      contentPadding: EdgeInsets.all(16.0),
      filled: true,
      fillColor: isFilled ? filledColor : unfilledColor,
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: Colors.transparent),
        borderRadius: BorderRadius.circular(8.0),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(color: Colors.transparent),
        borderRadius: BorderRadius.circular(8.0),
      ),
      counterText: "", // Hide the character counter text
    );
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      systemNavigationBarColor: Color.fromRGBO(249, 249, 255, 1),
      // navigation bar color
      statusBarColor: Color.fromRGBO(249, 249, 255, 1), // status bar color
    ));
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: _buildContent(),
    );
  }

  Widget _buildContent() {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, _) {
        if (!didPop) exit(0);
      },
      child: Scaffold(
        appBar: null,
        body: Container(
          color: Color.fromRGBO(249, 249, 255, 1),
          child: Stack(children: [
            Column(
              children: [
                SizedBox(height: 100.0),
                Center(
                  child: SvgPicture.asset(
                    'assets/ic_forgot_pwd.svg',
                    height: 200,
                  ),
                ),
              ],
            ),
            Container(
              alignment: Alignment.bottomCenter,
              child: SingleChildScrollView(
                child: Container(
                  decoration: BoxDecoration(
                      color: ThemeColor.themeOrange,
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(20.0))),
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
                        height: 40,
                      ),
                      Center(
                          child: Text(
                              Intl.message("pls_enter_email_code",
                                  name: "pls_enter_email_code"),
                              textAlign: TextAlign.center,
                              style: GoogleFonts.roboto(
                                  fontSize: 16.0,
                                  fontWeight: FontWeight.w400,
                                  color: Colors.black))),
                      Center(
                          child: Text(email,
                              textAlign: TextAlign.center,
                              style: GoogleFonts.roboto(
                                  fontSize: 16.0,
                                  fontWeight: FontWeight.w400,
                                  color: Colors.white))),
                      Container(
                        margin: EdgeInsets.fromLTRB(80, 20, 80, 20),
                        child: Center(
                            child: KeyboardListener(
                          focusNode: FocusNode(),
                          // Create an empty FocusNode
                          onKeyEvent: (KeyEvent event) {
                            if (event is KeyUpEvent &&
                                event.logicalKey ==
                                    LogicalKeyboardKey.backspace) {
                              for (int i = 0; i < focusNode.length; i++) {
                                if (focusNode[i].hasFocus &&
                                    controllers[i].text.isEmpty) {
                                  focusNode[i].unfocus();
                                  focusNode[i - 1].requestFocus();
                                }
                              }
                            }
                          },
                          child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: List.generate(otpLength, (index) {
                                bool isFilled =
                                    controllers[index].text.isNotEmpty;
                                return Container(
                                  width: 52.0,
                                  child: TextFormField(
                                    onChanged: (text) {
                                      setState(() {
                                        isFilled = text.isNotEmpty;
                                        if (index < 3) {
                                          focusNode[index].unfocus();
                                          focusNode[index + 1].requestFocus();
                                        }
                                      });
                                    },
                                    focusNode: focusNode[index],
                                    controller: controllers[index],
                                    maxLength: 1,
                                    keyboardType:
                                        TextInputType.numberWithOptions(
                                            signed: true),
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.roboto(
                                        color: Colors.black,
                                        fontStyle: FontStyle.normal,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w400),
                                    decoration:
                                        buildOtpInputDecoration(isFilled),
                                  ),
                                );
                              })),
                        )),
                      ),
                      Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                                Intl.message("code_not_received",
                                    name: "code_not_received"),
                                style: GoogleFonts.roboto(
                                    color: Colors.white,
                                    fontStyle: FontStyle.normal,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w400)),
                            SizedBox(
                              width: 20,
                            ),
                            if (isTimerStarted)
                              TextButton(
                                onPressed: () async {

                                },
                                child: Text(formatDuration(countdownDuration),
                                    style: GoogleFonts.roboto(
                                        color: Color.fromRGBO(69, 152, 209, 1),
                                        fontStyle: FontStyle.normal,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700)),
                              ),
                            if (!isTimerStarted)
                              TextButton(
                                  onPressed: () async {
                                    if (!isTimerStarted) {
                                      isTimerStarted = true;
                                      resentOTP();
                                      startTimer();
                                    }
                                  },
                                  child: Text(
                                      Intl.message("resend", name: "resend"),
                                      style: GoogleFonts.roboto(
                                          color:
                                              Color.fromRGBO(69, 152, 209, 1),
                                          fontStyle: FontStyle.normal,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700))),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Center(
                          child: TextButton(
                        style: TextButton.styleFrom(
                          fixedSize: Size(290, 50),
                          backgroundColor: Colors.white,
                          // Set the background color to black
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(
                                25.0), // Set the border radius
                          ),
                        ),
                        onPressed: () async {
                          verifyEmailOTP();
                        },
                        child: Text(Intl.message("send", name: "send"),
                            style: GoogleFonts.roboto(
                                color: Color.fromRGBO(69, 152, 209, 1),
                                fontSize: 16,
                                fontWeight: FontWeight.w700)),
                      )),
                      SizedBox(
                        height: 50,
                      )
                    ],
                  ),
                ),
              ),
            ),
            CustomToolbar(
                Intl.message("email_verification", name: "email_verification"),
                handleCallback,
                -1,
                false),
            if (loader) Progressbar(loader),
          ]),
        ),
      ),
    );
  }
}
