import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:com.urbaevent/model/ResponseAppleData.dart';
import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:easy_linkedin_login/easy_linkedin_login.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import 'SignIn.dart';
import 'SignUpStep2.dart';
import 'package:http/http.dart' as http;

class SignUp extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _SignUp();
}

class _SignUp extends State<SignUp> {
  bool _isPasswordVisible = false;

  TextEditingController _nameController = TextEditingController();
  TextEditingController _phoneController = TextEditingController();
  TextEditingController _emailController = TextEditingController();
  TextEditingController _passwordController = TextEditingController();
  TextEditingController _cnfPasswordController = TextEditingController();

  final FocusNode _nameFocus = FocusNode();
  final FocusNode _phoneFocus = FocusNode();
  final FocusNode _emailFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();
  final FocusNode _cnfFocus = FocusNode();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn googleSignIn = GoogleSignIn();
  String socialId = "";
  String provider = "";
  File? imageFile;

  final config = LinkedInConfig(
    clientId: '78kcdmw2pij8wd',
    clientSecret: '8q7htBpieQXUmhkB',
    redirectUrl: 'https://sib2026.ma',
  );

  UserObject? user;
  bool logoutUser = false;

  bool _isValidEmail(String email) {
    // Regular expression to validate email format
    final emailRegExp = RegExp(r'^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$');
    return emailRegExp.hasMatch(email);
  }

  void setUser(LinkedInUserModel u) {
    setState(() {
      user = UserObject(
        firstName: u.givenName ?? 'N/A',
        lastName: u.familyName ?? 'N/A',
        email: u.email ?? 'N/A',
        profileImageUrl: u.picture ?? 'N/A',
      );
      _nameController.text =
          user!.firstName!.toString() + " " + user!.lastName!.toString();
      _emailController.text = user!.email.toString();
      setState(() {
        socialId = user!.email.toString();
        provider = "linkedin";
      });
      downloadAndSaveImage(user!.profileImageUrl.toString());
      _phoneFocus.requestFocus();
      user = null;
      logoutUser = true;
    });
  }

  bool checkValidations() {
    if (_nameController.value.text.isEmpty) {
      Utils.showToast(Intl.message("msg_enter_name", name: "msg_enter_name"));
      return false;
    } else if (!_isValidEmail(_emailController.value.text)) {
      Utils.showToast(Intl.message("msg_enter_email", name: "msg_enter_email"));
      return false;
    } else if (_passwordController.value.text.length < 5 &&
        socialId.length == 0) {
      Utils.showToast(Intl.message("msg_pwd_length", name: "msg_pwd_length"));
      return false;
    } else if (_cnfPasswordController.value.text.isEmpty &&
        socialId.length == 0) {
      Utils.showToast(
          Intl.message("msg_cng_pwd_empty", name: "msg_cng_pwd_empty"));
      return false;
    } else if (_passwordController.value.text !=
            _cnfPasswordController.value.text &&
        socialId.length == 0) {
      Utils.showToast(
          Intl.message("msg_pwd_no_match", name: "msg_pwd_no_match"));
      return false;
    }
    return true;
  }

  void handleCallback() {
    Navigator.pop(context);
  }

  Future<void> getAppleData(AuthorizationCredentialAppleID credential) async {
    try {
      final appleData = await SupabaseService.instance
          .getAppleData(credential.userIdentifier.toString());

      if (appleData != null) {
        setState(() {
          _nameController.text = (appleData['first_name'] ?? '') +
              " " +
              (appleData['last_name'] ?? '');

          _emailController.text = appleData['email'].toString();

          socialId = appleData['social_id'].toString();
          provider = "apple";
          _phoneFocus.requestFocus();
        });
      } else {
        postAppleData(credential);
      }
    } catch (_) {
      postAppleData(credential);
    }
  }

  Future<void> postAppleData(AuthorizationCredentialAppleID credential) async {
    await SupabaseService.instance.saveAppleData(
      firstName: credential.givenName ?? '',
      lastName: credential.familyName ?? '',
      email: credential.email ?? '',
      socialId: credential.userIdentifier.toString(),
    );
  }

  Future<User?> _handleSignIn() async {
    try {
      final GoogleSignInAccount? googleSignInAccount =
          await googleSignIn.signIn();
      final GoogleSignInAuthentication googleSignInAuthentication =
          await googleSignInAccount!.authentication;

      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleSignInAuthentication.accessToken,
        idToken: googleSignInAuthentication.idToken,
      );

      final UserCredential authResult =
          await _auth.signInWithCredential(credential);
      final User? user = authResult.user;
      return user;
    } catch (error) {
      print(error);
      return null;
    }
  }

  Future<void> downloadAndSaveImage(String imageUrl) async {
    try {
      final response = await http.get(Uri.parse(imageUrl));
      if (response.statusCode == 200) {
        final Directory appDirectory = await getApplicationDocumentsDirectory();
        final String filePath = '${appDirectory.path}/my_image.jpg';
        imageFile = File(filePath);
        await imageFile!.writeAsBytes(response.bodyBytes);

        print('Image downloaded and saved to: $filePath');
      } else {
        print('Failed to download image: ${response.statusCode}');
      }
    } catch (e) {
      print('Error downloading image: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarIconBrightness: Brightness.dark,
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
          Flex(
            direction: Axis.vertical,
            children: [
              Expanded(
                flex: 1,
                child: Container(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.vertical,
                    child: Column(
                      children: [
                        SizedBox(height: 90.0),
                        Center(
                            child: Container(
                                margin: EdgeInsets.fromLTRB(20, 20, 20, 0),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10.0),
                                  color: Colors.white,
                                ),
                                child: Padding(
                                    padding:
                                        EdgeInsets.fromLTRB(20.0, 20, 20, 0),
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.stretch,
                                      children: [
                                        Container(
                                          decoration: BoxDecoration(
                                            color: Color.fromRGBO(
                                                249, 249, 255, 1),
                                            borderRadius:
                                                BorderRadius.circular(30.0),
                                          ),
                                          child: ClipRRect(
                                            borderRadius:
                                                BorderRadius.circular(30.0),
                                            child: LinkedInCustomButton(
                                              config: config,
                                              destroySession: true,
                                              onError: (error) => log(
                                                  'Error: ${error.message}'),
                                              onGetAuthToken: (data) => log(
                                                  'Access token ${data.accessToken!}'),
                                              onGetUserProfile: setUser,
                                              child: Container(
                                                height: 52,
                                                width: 295,
                                                alignment: Alignment.center,
                                                decoration: BoxDecoration(
                                                  color: Color.fromRGBO(
                                                      249, 249, 255, 1),
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          50.0),
                                                ),
                                                padding: EdgeInsets.all(10.0),
                                                child: Row(
                                                  mainAxisSize:
                                                      MainAxisSize.min,
                                                  children: [
                                                    Image.asset(
                                                      'assets/linkedin.png',
                                                      width: 25.0,
                                                      height: 25.0,
                                                    ),
                                                    SizedBox(width: 10.0),
                                                    Text(
                                                      Intl.message(
                                                          "connect_with_linkedin",
                                                          name:
                                                              "connect_with_linkedin"),
                                                      style: GoogleFonts.roboto(
                                                          fontSize: 20.0,
                                                          fontWeight:
                                                              FontWeight.w400,
                                                          color: ThemeColor
                                                              .textPrimary),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                        SizedBox(
                                          height: 10,
                                        ),
                                        GestureDetector(
                                          onTap: () async {
                                            User? user = await _handleSignIn();
                                            if (user != null) {
                                              // Successfully signed in with Google
                                              _nameController.text =
                                                  user.displayName.toString();
                                              _emailController.text =
                                                  user.email.toString();
                                              setState(() {
                                                socialId = user.uid.toString();
                                                provider = "google";
                                              });
                                              downloadAndSaveImage(
                                                  user.photoURL.toString());
                                              _phoneFocus.requestFocus();
                                            } else {
                                              // Sign-in failed
                                              Utils.showToast("Sign In failed");
                                            }
                                            googleSignIn.signOut();
                                          },
                                          child: Container(
                                            height: 52,
                                            alignment: Alignment.center,
                                            decoration: BoxDecoration(
                                              color: Color.fromRGBO(
                                                  249, 249, 255, 1),
                                              borderRadius:
                                                  BorderRadius.circular(30.0),
                                            ),
                                            padding: EdgeInsets.all(10.0),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Image.asset(
                                                  'assets/google.png',
                                                  width: 22.0,
                                                  height: 22.0,
                                                ),
                                                SizedBox(width: 10.0),
                                                Text(
                                                  Intl.message(
                                                      "connect_with_google",
                                                      name:
                                                          "connect_with_google"),
                                                  style: GoogleFonts.roboto(
                                                      fontSize: 20.0,
                                                      fontWeight:
                                                          FontWeight.w400,
                                                      color: ThemeColor
                                                          .textPrimary),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                        SizedBox(height: 10),
                                        if (Platform.isIOS)
                                          SignInWithAppleButton(
                                            text: Intl.message(
                                                "connect_with_apple",
                                                name: "connect_with_apple"),
                                            onPressed: () async {
                                              final credential =
                                                  await SignInWithApple
                                                      .getAppleIDCredential(
                                                scopes: [
                                                  AppleIDAuthorizationScopes
                                                      .email,
                                                  AppleIDAuthorizationScopes
                                                      .fullName,
                                                ],
                                              );

                                              Preference preference =
                                                  await Preference
                                                      .getInstance();

                                              if (credential.email != null) {
                                                preference.setAppleEmail(
                                                    credential.email ?? "");
                                              }
                                              if (credential.givenName !=
                                                  null) {
                                                preference.setAppleName(
                                                    credential.givenName! +
                                                        " " +
                                                        credential.familyName!);
                                              }
                                              if (credential.userIdentifier !=
                                                  null) {
                                                preference.setAppleUerId(
                                                    credential.userIdentifier!);
                                              }

                                              getAppleData(credential);

                                              setState(() {
                                                _nameController.text =
                                                    preference.getAppleName();

                                                if (preference
                                                    .getAppleEmail()
                                                    .trim()
                                                    .isEmpty) {
                                                  _emailController
                                                      .text = preference
                                                          .getAppleUserId() +
                                                      "@apple.com";
                                                } else {
                                                  _emailController.text =
                                                      preference
                                                          .getAppleEmail();
                                                }

                                                socialId =
                                                    preference.getAppleUserId();
                                                provider = "apple";
                                                _phoneFocus.requestFocus();
                                              });

                                              // This is the endpoint that will convert an authorization code obtained
                                              // via Sign in with Apple into a session in your system
                                              final signInWithAppleEndpoint =
                                                  Uri(
                                                scheme: 'https',
                                                host:
                                                    'flutter-sign-in-with-apple-example.glitch.me',
                                                path: '/sign_in_with_apple',
                                                queryParameters: <String,
                                                    String>{
                                                  'code': credential
                                                      .authorizationCode,
                                                  if (credential.givenName !=
                                                      null)
                                                    'firstName':
                                                        credential.givenName!,
                                                  if (credential.familyName !=
                                                      null)
                                                    'lastName':
                                                        credential.familyName!,
                                                  'useBundleId':
                                                      (Platform.isIOS ||
                                                              Platform.isMacOS)
                                                          ? 'true'
                                                          : 'false',
                                                  if (credential.state != null)
                                                    'state': credential.state!,
                                                },
                                              );

                                              await http.Client().post(
                                                signInWithAppleEndpoint,
                                              );
                                            },
                                          ),
                                        SizedBox(height: 10),
                                        Center(
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: [
                                              SizedBox(width: 30),
                                              Expanded(
                                                child: Divider(
                                                  color: Color.fromRGBO(
                                                      132, 130, 130, 1),
                                                  thickness: 1.0,
                                                ),
                                              ),
                                              Padding(
                                                padding: EdgeInsets.symmetric(
                                                    horizontal: 16.0),
                                                child: Text(
                                                  Intl.message("or",
                                                      name: "or"),
                                                  style: GoogleFonts.roboto(
                                                      fontSize: 18.0,
                                                      fontWeight:
                                                          FontWeight.w400,
                                                      color: Color.fromRGBO(
                                                          132, 130, 130, 1)),
                                                ),
                                              ),
                                              Expanded(
                                                child: Divider(
                                                  color: Color.fromRGBO(
                                                      132, 130, 130, 1),
                                                  thickness: 1.0,
                                                ),
                                              ),
                                              SizedBox(width: 30),
                                            ],
                                          ),
                                        ),
                                        SizedBox(height: 10),
                                        SizedBox(
                                          height: 52,
                                          child: TextFormField(
                                            onEditingComplete: () {
                                              _emailFocus.requestFocus();
                                            },
                                            focusNode: _nameFocus,
                                            style: GoogleFonts.roboto(
                                                color: ThemeColor.textPrimary,
                                                fontStyle: FontStyle.normal,
                                                fontSize: 16,
                                                fontWeight: FontWeight.w400),
                                            controller: _nameController,
                                            keyboardType:
                                                TextInputType.emailAddress,
                                            decoration: InputDecoration(
                                              labelText: Intl.message("name",
                                                  name: "name"),
                                              suffixIconConstraints:
                                                  BoxConstraints.tightFor(
                                                      width: 34, height: 34),
                                              suffixIcon: Image.asset(
                                                'assets/asterisk.png',
                                              ),
                                              border: OutlineInputBorder(
                                                borderSide: BorderSide.none,
                                                borderRadius:
                                                    BorderRadius.circular(25.0),
                                              ),
                                              fillColor: Color.fromRGBO(
                                                  249, 249, 255, 1),
                                              filled: true,
                                              contentPadding:
                                                  EdgeInsets.symmetric(
                                                      horizontal: 20),
                                              floatingLabelBehavior:
                                                  FloatingLabelBehavior.never,
                                            ),
                                          ),
                                        ),
                                        SizedBox(height: 16),
                                        SizedBox(
                                          height: 52,
                                          child: TextFormField(
                                            enabled: socialId.length == 0,
                                            onEditingComplete: () {
                                              _phoneFocus.requestFocus();
                                            },
                                            focusNode: _emailFocus,
                                            textAlignVertical:
                                                TextAlignVertical.center,
                                            style: GoogleFonts.roboto(
                                                color: ThemeColor.textPrimary,
                                                fontStyle: FontStyle.normal,
                                                fontSize: 16,
                                                fontWeight: FontWeight.w400),
                                            controller: _emailController,
                                            keyboardType:
                                                TextInputType.emailAddress,
                                            decoration: InputDecoration(
                                              labelText: Intl.message("email",
                                                  name: "email"),
                                              suffixIconConstraints:
                                                  BoxConstraints.tightFor(
                                                      width: 34, height: 34),
                                              suffixIcon: Image.asset(
                                                'assets/asterisk.png',
                                                width: 7,
                                                height: 7,
                                              ),
                                              border: OutlineInputBorder(
                                                borderSide: BorderSide.none,
                                                borderRadius:
                                                    BorderRadius.circular(25.0),
                                              ),
                                              fillColor: Color.fromRGBO(
                                                  249, 249, 255, 1),
                                              filled: true,
                                              contentPadding:
                                                  EdgeInsets.symmetric(
                                                      horizontal: 20),
                                              floatingLabelBehavior:
                                                  FloatingLabelBehavior.never,
                                            ),
                                          ),
                                        ),
                                        SizedBox(height: 16),
                                        SizedBox(
                                          height: 52,
                                          child: TextFormField(
                                            focusNode: _phoneFocus,
                                            onEditingComplete: () {
                                              _passwordFocus.requestFocus();
                                            },
                                            style: GoogleFonts.roboto(
                                                color: ThemeColor.textPrimary,
                                                fontStyle: FontStyle.normal,
                                                fontSize: 16,
                                                fontWeight: FontWeight.w400),
                                            controller: _phoneController,
                                            keyboardType: TextInputType.phone,
                                            decoration: InputDecoration(
                                              contentPadding:
                                                  EdgeInsets.symmetric(
                                                      horizontal: 20),
                                              labelText: Intl.message(
                                                  "phone_number",
                                                  name: "phone_number"),
                                              border: OutlineInputBorder(
                                                borderSide: BorderSide.none,
                                                borderRadius:
                                                    BorderRadius.circular(25.0),
                                              ),
                                              fillColor: Color.fromRGBO(
                                                  249, 249, 255, 1),
                                              filled: true,
                                              floatingLabelBehavior:
                                                  FloatingLabelBehavior.never,
                                            ),
                                          ),
                                        ),
                                        SizedBox(height: 16.0),
                                        if (socialId.length == 0)
                                          SizedBox(
                                            height: 52,
                                            child: TextFormField(
                                              focusNode: _passwordFocus,
                                              onEditingComplete: () {
                                                _cnfFocus.requestFocus();
                                              },
                                              textAlignVertical:
                                                  TextAlignVertical.center,
                                              style: GoogleFonts.roboto(
                                                  color: ThemeColor.textPrimary,
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w400),
                                              controller: _passwordController,
                                              obscureText: !_isPasswordVisible,
                                              decoration: InputDecoration(
                                                labelText: Intl.message(
                                                    "password",
                                                    name: "password"),
                                                border: OutlineInputBorder(
                                                  borderSide: BorderSide.none,
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          25.0),
                                                ),
                                                filled: true,
                                                fillColor: Color.fromRGBO(
                                                    249, 249, 255, 1),
                                                floatingLabelBehavior:
                                                    FloatingLabelBehavior.never,
                                                contentPadding:
                                                    EdgeInsets.symmetric(
                                                        horizontal: 20),
                                                suffixIcon: IconButton(
                                                  icon: Icon(
                                                    _isPasswordVisible
                                                        ? Icons
                                                            .visibility_off_outlined
                                                        : Icons
                                                            .visibility_outlined,
                                                  ),
                                                  onPressed: () {
                                                    setState(() {
                                                      _isPasswordVisible =
                                                          !_isPasswordVisible;
                                                    });
                                                  },
                                                ),
                                              ),
                                            ),
                                          ),
                                        if (socialId.length == 0)
                                          SizedBox(height: 16.0),
                                        if (socialId.length == 0)
                                          SizedBox(
                                            height: 52,
                                            child: TextFormField(
                                              focusNode: _cnfFocus,
                                              onEditingComplete: () {
                                                if (checkValidations()) {
                                                  Navigator.push(
                                                    context,
                                                    MaterialPageRoute(
                                                        builder: (context) =>
                                                            SignUpStep2(
                                                                _nameController
                                                                    .value.text,
                                                                _phoneController
                                                                    .value.text,
                                                                _emailController
                                                                    .value.text,
                                                                _passwordController
                                                                    .value.text,
                                                                socialId,
                                                                provider,
                                                                imageFile)),
                                                  );
                                                }
                                              },
                                              style: GoogleFonts.roboto(
                                                  color: ThemeColor.textPrimary,
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w400),
                                              controller:
                                                  _cnfPasswordController,
                                              obscureText: !_isPasswordVisible,
                                              decoration: InputDecoration(
                                                labelText: Intl.message(
                                                    "cnf_password",
                                                    name: "cnf_password"),
                                                border: OutlineInputBorder(
                                                  borderSide: BorderSide.none,
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          25.0),
                                                ),
                                                filled: true,
                                                contentPadding:
                                                    EdgeInsets.symmetric(
                                                        horizontal: 20),
                                                fillColor: Color.fromRGBO(
                                                    249, 249, 255, 1),
                                                floatingLabelBehavior:
                                                    FloatingLabelBehavior.never,
                                                suffixIcon: IconButton(
                                                  icon: Icon(
                                                    _isPasswordVisible
                                                        ? Icons
                                                            .visibility_off_outlined
                                                        : Icons
                                                            .visibility_outlined,
                                                  ),
                                                  onPressed: () {
                                                    setState(() {
                                                      _isPasswordVisible =
                                                          !_isPasswordVisible;
                                                    });
                                                  },
                                                ),
                                              ),
                                            ),
                                          ),
                                        SizedBox(height: 30.0),
                                        Center(
                                            child: TextButton(
                                                style: TextButton.styleFrom(
                                                  fixedSize: Size(290, 50),
                                                  backgroundColor:
                                                      Color.fromRGBO(
                                                          69, 152, 209, 1),
                                                  // Set the background color to black
                                                  shape: RoundedRectangleBorder(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            25.0), // Set the border radius
                                                  ),
                                                ),
                                                onPressed: () {
                                                  if (checkValidations()) {
                                                    Navigator.push(
                                                      context,
                                                      PageRouteBuilder(
                                                        pageBuilder: (context,
                                                                animation,
                                                                secondaryAnimation) =>
                                                            SignUpStep2(
                                                                _nameController
                                                                    .value.text,
                                                                _phoneController
                                                                    .value.text,
                                                                _emailController
                                                                    .value.text,
                                                                _passwordController
                                                                    .value.text,
                                                                socialId,
                                                                provider,
                                                                imageFile),
                                                        transitionsBuilder:
                                                            (context,
                                                                animation,
                                                                secondaryAnimation,
                                                                child) {
                                                          const begin = Offset(
                                                              1.0,
                                                              0.0); // Slide from right
                                                          const end =
                                                              Offset.zero;
                                                          const curve =
                                                              Curves.easeInOut;
                                                          var tween = Tween(
                                                                  begin: begin,
                                                                  end: end)
                                                              .chain(CurveTween(
                                                                  curve:
                                                                      curve));
                                                          var offsetAnimation =
                                                              animation
                                                                  .drive(tween);
                                                          return SlideTransition(
                                                              position:
                                                                  offsetAnimation,
                                                              child: child);
                                                        },
                                                      ),
                                                    );
                                                  }
                                                },
                                                child: Text(
                                                    Intl.message("next",
                                                        name: "next"),
                                                    style: GoogleFonts.roboto(
                                                        color: Colors.white,
                                                        fontSize: 20,
                                                        fontWeight:
                                                            FontWeight.w500)))),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.center,
                                          children: [
                                            Text(
                                                Intl.message("you_have_account",
                                                    name: "you_have_account"),
                                                style: GoogleFonts.roboto(
                                                    color: Colors.black,
                                                    fontStyle: FontStyle.normal,
                                                    fontSize: 16,
                                                    fontWeight:
                                                        FontWeight.w500)),
                                            TextButton(
                                                onPressed: () async {
                                                  Navigator.push(
                                                    context,
                                                    PageRouteBuilder(
                                                      pageBuilder: (context,
                                                              animation,
                                                              secondaryAnimation) =>
                                                          SignIn(),
                                                      transitionsBuilder:
                                                          (context,
                                                              animation,
                                                              secondaryAnimation,
                                                              child) {
                                                        const begin = Offset(
                                                            1.0,
                                                            0.0); // Slide from right
                                                        const end = Offset.zero;
                                                        const curve =
                                                            Curves.easeInOut;
                                                        var tween = Tween(
                                                                begin: begin,
                                                                end: end)
                                                            .chain(CurveTween(
                                                                curve: curve));
                                                        var offsetAnimation =
                                                            animation
                                                                .drive(tween);
                                                        return SlideTransition(
                                                            position:
                                                                offsetAnimation,
                                                            child: child);
                                                      },
                                                    ),
                                                  );
                                                },
                                                child: Text(
                                                    Intl.message("login_",
                                                        name: "login_"),
                                                    style: GoogleFonts.roboto(
                                                        color: Color.fromRGBO(
                                                            235, 154, 68, 1),
                                                        fontStyle:
                                                            FontStyle.normal,
                                                        fontSize: 16,
                                                        fontWeight:
                                                            FontWeight.w500))),
                                          ],
                                        ),
                                      ],
                                    )))),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          CustomToolbar(Intl.message("sign_up", name: "sign_up"),
              handleCallback, -1, false)
        ]),
      ),
    );
  }
}

class UserObject {
  UserObject({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.profileImageUrl,
  });

  final String? firstName;
  final String? lastName;
  final String? email;
  final String? profileImageUrl;
}
