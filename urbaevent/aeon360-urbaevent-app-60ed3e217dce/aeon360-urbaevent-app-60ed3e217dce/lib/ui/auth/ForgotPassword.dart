import 'dart:async';

import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:com.urbaevent/ui/auth/SignIn.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class ForgotPassword extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _ForgotPassword();
}

class _ForgotPassword extends State<ForgotPassword> {
  void handleCallback() {
    Navigator.pop(context);
  }

  bool loader = false;
  Color filledColor = Colors.white;
  Color unfilledColor = Color.fromRGBO(249, 249, 255, 0.7843137254901961);
  final int otpLength = 4; // The length of the OTP
  final List<TextEditingController> controllers =
      List.generate(4, (_) => TextEditingController());

  TextEditingController _emailController = TextEditingController();
  TextEditingController _pwdController = TextEditingController();
  TextEditingController _cnfPwdController = TextEditingController();

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

  bool _isValidEmail(String email) {
    // Regular expression to validate email format
    final emailRegExp = RegExp(r'^[\w.-]+@[\w.-]+\.\w+$');
    return emailRegExp.hasMatch(email);
  }

  bool checkValidations() {
    if (!_isValidEmail(_emailController.value.text)) {
      Utils.showToast(Intl.message("msg_enter_email", name: "msg_enter_email"));
      return false;
    }
    return true;
  }

  Future<void> resetPassword() async {
    // Supabase uses link-based password reset (no OTP code)
    // Password update is handled in PasswordVisibilityDialog
    setState(() { loader = false; });
  }

  // ── Mot de passe oublié via Supabase ───────────────────────────────
  Future<void> forgotPassword() async {
    setState(() {
      loader = true;
    });
    try {
      await SupabaseService.instance.resetPassword(_emailController.value.text.trim());
      Utils.showToast(Intl.message('msg_email_sent', name: 'msg_email_sent'));
      if (mounted) Navigator.pop(context);
    } catch (_) {
      Utils.showToast(Intl.message('msg_enter_email', name: 'msg_enter_email'));
    }
    setState(() {
      loader = false;
    });
  }

  void _showOTPDialog() {
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
          return OTPDialog(loader, _emailController, controllers,
              _pwdController, _cnfPwdController);
        });
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
    return Scaffold(
      appBar: null,
      body: Container(
        color: Color.fromRGBO(249, 249, 255, 1),
        child: Stack(children: [
          SingleChildScrollView(
            scrollDirection: Axis.vertical,
            child: Column(
              children: [
                SizedBox(height: 90.0),
                SvgPicture.asset(
                  'assets/ic_forgot_pwd.svg',
                  height: 200,
                ),
                Center(
                    child: Card(
                        elevation: 0,
                        margin: EdgeInsets.fromLTRB(20, 20, 20, 0),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20.0),
                        ),
                        child: Padding(
                            padding: EdgeInsets.fromLTRB(20.0, 30, 20, 30),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Text(
                                  Intl.message("msg_email_sent_to",
                                      name: "msg_email_sent_to"),
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.roboto(
                                      fontSize: 18,
                                      decoration: TextDecoration.none,
                                      fontWeight: FontWeight.w400,
                                      color: Colors.black),
                                ),
                                SizedBox(height: 18),
                                SizedBox(
                                  height: 52,
                                  child: TextFormField(
                                    controller: _emailController,
                                    keyboardType: TextInputType.emailAddress,
                                    decoration: InputDecoration(
                                      labelText: 'Email',
                                      border: OutlineInputBorder(
                                        borderSide: BorderSide.none,
                                        borderRadius:
                                            BorderRadius.circular(25.0),
                                      ),
                                      fillColor:
                                          Color.fromRGBO(249, 249, 255, 1),
                                      filled: true,
                                      contentPadding:
                                          EdgeInsets.symmetric(horizontal: 20),
                                      floatingLabelBehavior:
                                          FloatingLabelBehavior.never,
                                      prefixIconConstraints:
                                          BoxConstraints.tightFor(
                                              width: 55, height: 55),
                                      prefixIcon: Padding(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 18.0),
                                        child: SvgPicture.asset(
                                            'assets/ic_email.svg'),
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(height: 40.0),
                                Center(
                                    child: TextButton(
                                        style: TextButton.styleFrom(
                                          fixedSize: Size(290, 50),
                                          backgroundColor:
                                              Color.fromRGBO(69, 152, 209, 1),
                                          // Set the background color to black
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                                25.0), // Set the border radius
                                          ),
                                        ),
                                        onPressed: () {
                                          if (checkValidations()) {
                                            forgotPassword();
                                          }
                                        },
                                        child: Text(
                                            Intl.message("send", name: "send"),
                                            style: GoogleFonts.roboto(
                                                color: Colors.white,
                                                fontSize: 20,
                                                fontWeight: FontWeight.w500)))),
                              ],
                            )))),
              ],
            ),
          ),
          CustomToolbar("Forgot Password?", handleCallback, -1, false),
          if (loader) Progressbar(loader),
        ]),
      ),
    );
  }
}

class OTPDialog extends StatefulWidget {
  bool loader;



  List<TextEditingController> controllers =
      List.generate(4, (_) => TextEditingController());

  TextEditingController _emailController = TextEditingController();
  TextEditingController _pwdController = TextEditingController();
  TextEditingController _cnfPwdController = TextEditingController();

  OTPDialog(this.loader, this._emailController, this.controllers,
      this._pwdController, this._cnfPwdController);

  @override
  _OTPDialogState createState() => _OTPDialogState();
}

class _OTPDialogState extends State<OTPDialog> {
  Color filledColor = Colors.white;
  Color unfilledColor = Color.fromRGBO(249, 249, 255, 0.7843137254901961);
  final List<FocusNode> focusNode = List.generate(4, (_) => FocusNode());
  bool isTimerStarted = false;

  late Timer timer;
  late Duration countdownDuration;

  void startTimer() {
    timer = Timer.periodic(Duration(seconds: 1), (timer) {
      setState(() {
        if (countdownDuration.inSeconds > 0) {
          countdownDuration -= Duration(seconds: 1);
        } else {
          isTimerStarted = false;
          timer.cancel();
        }
      });
    });
  }

  Future<void> resentOTP() async {
    try {
      await SupabaseService.instance.resetPassword(widget._emailController.text.trim());
    } catch (e) {
      Utils.showToast(e.toString());
      setState(() {
        isTimerStarted = false;
        timer.cancel();
      });
    }
  }

  String formatDuration(Duration duration) {
    return '${duration.inMinutes.toString().padLeft(2, '0')}:${(duration.inSeconds % 60).toString().padLeft(2, '0')}';
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

  void _showChangePasswordDialog() {
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
          return PasswordVisibilityDialog(widget.loader, widget.controllers,
              widget._pwdController, widget._cnfPwdController);
        });
  }

  @override
  void initState() {
    super.initState();
    countdownDuration = Duration(minutes: 1);
    for (int i = 0; i < focusNode.length; i++) {
      focusNode[i].addListener(_handleFocusChange);
    }
  }

  void _handleFocusChange() {
    for (int i = 0; i < focusNode.length; i++) {
      if (focusNode[i].hasFocus) {
        // The widget has focus, so add a listener for key events.
        RawKeyboard.instance.addListener(_handleKeyPress);
      } else {
        // The widget lost focus, remove the listener.
        RawKeyboard.instance.removeListener(_handleKeyPress);
      }
    }
  }

  void _handleKeyPress(RawKeyEvent event) {
    if (event is RawKeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.backspace) {
      for (int i = 0; i < focusNode.length; i++) {
        if (focusNode[i].hasFocus && widget.controllers[i].text.isEmpty) {
          focusNode[i].unfocus();
          focusNode[i - 1].requestFocus();
        }
      }
    }
  }

  @override
  void dispose() {
    for (int i = 0; i < focusNode.length; i++) {
      focusNode[i].dispose();
    }
    RawKeyboard.instance.removeListener(_handleKeyPress);
    timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final int otpLength = 4;
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
                child: Text(
                    Utils.obfuscateEmail(
                        widget._emailController.text.toString()),
                    textAlign: TextAlign.center,
                    style: GoogleFonts.roboto(
                        fontSize: 16.0,
                        fontWeight: FontWeight.w400,
                        color: Colors.white))),
            Container(
              margin: EdgeInsets.fromLTRB(80, 20, 80, 20),
              child: Center(
                  child: RawKeyboardListener(
                focusNode: FocusNode(),
                onKey: (RawKeyEvent event) {
                  if (event is RawKeyUpEvent &&
                      event.logicalKey == LogicalKeyboardKey.backspace) {
                    for (int i = 0; i < focusNode.length; i++) {
                      if (focusNode[i].hasFocus &&
                          widget.controllers[i].text.isEmpty) {
                        focusNode[i].unfocus();
                        focusNode[i - 1].requestFocus();
                      }
                    }
                  }
                },
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(otpLength, (index) {
                      bool isFilled = widget.controllers[index].text.isNotEmpty;
                      return SizedBox(
                        width: 52.0,
                        child: TextField(
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
                          controller: widget.controllers[index],
                          maxLength: 1,
                          keyboardType:
                              TextInputType.numberWithOptions(signed: true),
                          textAlign: TextAlign.center,
                          style: GoogleFonts.roboto(
                              color: ThemeColor.colorAccent,
                              fontStyle: FontStyle.normal,
                              fontSize: 16,
                              fontWeight: FontWeight.w400),
                          decoration: buildOtpInputDecoration(isFilled),
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
                      onPressed: () {

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
                      _showChangePasswordDialog();
                    },
                    child: Text(Intl.message("send", name: "send"),
                        style: GoogleFonts.roboto(
                            color: Color.fromRGBO(69, 152, 209, 1),
                            fontSize: 16,
                            fontWeight: FontWeight.w700)))),
            SizedBox(height: 32.0),
          ],
        ),
      ),
    );
  }
}

class PasswordVisibilityDialog extends StatefulWidget {
  bool loader;

  List<TextEditingController> controllers =
      List.generate(4, (_) => TextEditingController());
  final TextEditingController _passwordController;
  final TextEditingController _cnfPasswordController;

  PasswordVisibilityDialog(this.loader, this.controllers,
      this._passwordController, this._cnfPasswordController);

  @override
  _PasswordVisibilityDialogState createState() =>
      _PasswordVisibilityDialogState();
}

class _PasswordVisibilityDialogState extends State<PasswordVisibilityDialog> {
  Future<void> resetPassword() async {
    setState(() { widget.loader = true; });
    try {
      await SupabaseService.instance.supabaseClient.auth.updateUser(
        UserAttributes(password: widget._passwordController.value.text),
      );
      Utils.showToast(Intl.message("msg_pwd_changed", name: "msg_pwd_changed"));
      if (!context.mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => SignIn()),
        (route) => false,
      );
    } catch (e) {
      Utils.showToast(e.toString());
    }
    setState(() { widget.loader = false; });
  }

  bool _isPasswordVisible = false;
  bool _isCnfPasswordVisible = false;
  FocusNode focusNew = FocusNode();
  FocusNode focusCnf = FocusNode();

  bool checkValidations() {
    if (widget._passwordController.value.text.length < 5) {
      Utils.showToast(Intl.message("msg_pwd_length", name: "msg_pwd_length"));
      return false;
    } else if (widget._cnfPasswordController.value.text.isEmpty) {
      Utils.showToast(
          Intl.message("msg_cng_pwd_empty", name: "msg_cng_pwd_empty"));
      return false;
    } else if (widget._passwordController.value.text !=
        widget._cnfPasswordController.value.text) {
      Utils.showToast(
          Intl.message("msg_pwd_no_match", name: "msg_pwd_no_match"));
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
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
              height: 100,
            ),
            SizedBox(
              height: 52,
              width: 330,
              child: TextFormField(
                focusNode: focusNew,
                onEditingComplete: () {
                  focusCnf.requestFocus();
                },
                controller: widget._passwordController,
                obscureText: !_isPasswordVisible,
                style: GoogleFonts.roboto(
                    fontSize: 18.0,
                    fontWeight: FontWeight.w400,
                    color: Colors.black),
                decoration: InputDecoration(
                  hintStyle: TextStyle(
                      color: Color.fromRGBO(132, 130, 130, 0.8745098039215686)),
                  labelText: Intl.message("password", name: "password"),
                  border: OutlineInputBorder(
                    borderSide: BorderSide.none,
                    borderRadius: BorderRadius.circular(25.0),
                  ),
                  filled: true,
                  fillColor: Color.fromRGBO(249, 249, 255, 1),
                  floatingLabelBehavior: FloatingLabelBehavior.never,
                  contentPadding: EdgeInsets.symmetric(horizontal: 20),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isPasswordVisible
                          ? Icons.visibility_off
                          : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        _isPasswordVisible = !_isPasswordVisible;
                      });
                    },
                  ),
                ),
              ),
            ),
            SizedBox(height: 16.0),
            SizedBox(
              height: 52,
              width: 330,
              child: TextFormField(
                focusNode: focusCnf,
                onEditingComplete: () {
                  if (checkValidations()) {
                    resetPassword();
                  }
                },
                controller: widget._cnfPasswordController,
                obscureText: !_isCnfPasswordVisible,
                style: GoogleFonts.roboto(
                    fontSize: 18.0,
                    fontWeight: FontWeight.w400,
                    color: Colors.black),
                decoration: InputDecoration(
                  labelText: Intl.message("cnf_password", name: "cnf_password"),
                  hintStyle: TextStyle(
                      color: Color.fromRGBO(132, 130, 130, 0.8745098039215686)),
                  border: OutlineInputBorder(
                    borderSide: BorderSide.none,
                    borderRadius: BorderRadius.circular(25.0),
                  ),
                  filled: true,
                  contentPadding: EdgeInsets.symmetric(horizontal: 20),
                  fillColor: Color.fromRGBO(249, 249, 255, 1),
                  floatingLabelBehavior: FloatingLabelBehavior.never,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isCnfPasswordVisible
                          ? Icons.visibility_off
                          : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        _isCnfPasswordVisible = !_isCnfPasswordVisible;
                      });
                    },
                  ),
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
                        resetPassword();
                      }
                    },
                    child: Text(Intl.message("send", name: "send"),
                        style: GoogleFonts.roboto(
                            color: Color.fromRGBO(69, 152, 209, 1),
                            fontSize: 16,
                            fontWeight: FontWeight.w700)))),
            SizedBox(height: 32.0),
          ],
        ),
      ),
    );
  }
}
