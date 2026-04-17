import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:com.urbaevent/model/ResponseAppleData.dart';
import 'package:com.urbaevent/ui/auth/ForgotPassword.dart';
import 'package:com.urbaevent/ui/content_ui/agent/AgentHomepage.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:easy_linkedin_login/easy_linkedin_login.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';
import 'package:com.urbaevent/model/ResponseLogin.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/ui/content_ui/home/SalonListPage.dart';
import 'package:com.urbaevent/ui/auth/SignUp.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

class SignIn extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _SignIn();
}

class _SignIn extends State<SignIn> {
  bool loader = false;
  bool _isPasswordVisible = false;
  final GoogleSignIn googleSignIn = GoogleSignIn();

  final config = LinkedInConfig(
    clientId: '78kcdmw2pij8wd',
    clientSecret: '8q7htBpieQXUmhkB',
    redirectUrl: 'https://sib2026.ma',
  );

  UserObject? user;
  bool logoutUser = false;

  TextEditingController _emailController = TextEditingController();
  TextEditingController _passwordController = TextEditingController();

  final FocusNode _emailFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();

  bool _isValidEmail(String email) {
    // Regular expression to validate email format
    final emailRegExp = RegExp(r'^[\w.-]+@[\w.-]+\.\w+$');
    return emailRegExp.hasMatch(email);
  }

  Future<Map<String, dynamic>?> _handleSignIn() async {
    try {
      final GoogleSignInAccount? googleSignInAccount =
          await googleSignIn.signIn();
      if (googleSignInAccount == null) return null;
      final GoogleSignInAuthentication googleSignInAuthentication =
          await googleSignInAccount.authentication;

      return {
        'idToken': googleSignInAuthentication.idToken,
        'accessToken': googleSignInAuthentication.accessToken,
        'email': googleSignInAccount.email,
        'displayName': googleSignInAccount.displayName,
      };
    } catch (error) {
      print(error);
      return null;
    }
  }

  bool checkValidations() {
    if (!_isValidEmail(_emailController.value.text)) {
      Utils.showToast(Intl.message("msg_enter_email", name: "msg_enter_email"));
      return false;
    } else if (_passwordController.value.text.length < 5) {
      Utils.showToast(Intl.message("msg_enter_pwd", name: "msg_enter_pwd"));
      return false;
    }
    return true;
  }

  void handleCallback() {
    Navigator.pop(context);
  }

  void initialization() async {
    FlutterNativeSplash.remove();
  }

  @override
  void initState() {
    initialization();
    super.initState();
  }

  // ── Connexion email/mot de passe via Supabase ─────────────────────
  Future<void> signIn() async {
    setState(() {
      loader = true;
    });
    try {
      final res = await SupabaseService.instance.signIn(
        _emailController.value.text.trim(),
        _passwordController.value.text,
      );
      if (res.user != null) {
        final preference = await Preference.getInstance();
        await preference.setUserUUID(res.user!.id);
        await navigateAfterLogin();
      } else {
        Utils.showToast(Intl.message('msg_login_invalid', name: 'msg_login_invalid'));
      }
    } catch (_) {
      Utils.showToast(Intl.message('msg_login_invalid', name: 'msg_login_invalid'));
    }
    setState(() {
      loader = false;
    });
  }

  Future<void> socialSignInLinkedIn(UserObject user) async {
    setState(() {
      loader = true;
    });

    try {
      final email = user.email ?? '';
      final result = await SupabaseService.instance.socialSignIn(
        email: email,
        provider: 'linkedin',
        name: '${user.firstName ?? ''} ${user.lastName ?? ''}'.trim(),
        socialId: email,
      );

      // Mettre à jour le profil (synchronise nom/email à chaque connexion)
      await SupabaseService.instance.updateUserProfile(
        result['user_id'],
        {
          'email': email,
          'name': '${user.firstName ?? ''} ${user.lastName ?? ''}'.trim(),
          'provider': 'linkedin',
          'type': 'visitor',
          'status': 'active',
        },
      );

      Preference preference = await Preference.getInstance();
      await preference.setUserUUID(result['user_id']);

      await navigateAfterLogin();
    } catch (e) {
      debugPrint('socialSignInLinkedIn error: $e');
      Utils.showToast(e.toString());
    }
    setState(() {
      loader = false;
    });
  }

  Future<void> socialSignInApple(AuthorizationCredentialAppleID credential) async {
    setState(() {
      loader = true;
    });

    try {
      final identityToken = credential.identityToken;
      if (identityToken == null || identityToken.isEmpty) {
        throw Exception('Apple identityToken manquant');
      }

      // Authentification directe via OAuth token Supabase
      final authResponse =
          await SupabaseService.instance.signInWithApple(identityToken);

      if (authResponse.user != null) {
        // Sauvegarder les données Apple (nom/email) pour la première connexion
        final email = credential.email ??
            authResponse.user!.email ??
            '';
        final firstName = credential.givenName ?? '';
        final lastName = credential.familyName ?? '';

        if (email.isNotEmpty) {
          await SupabaseService.instance.saveAppleData(
            firstName: firstName,
            lastName: lastName,
            email: email,
            socialId: credential.userIdentifier ?? authResponse.user!.id,
          );
        }

        // Créer/mettre à jour le profil utilisateur
        final name = (firstName.isNotEmpty || lastName.isNotEmpty)
            ? '$firstName $lastName'.trim()
            : email.split('@').first;

        await SupabaseService.instance.updateUserProfile(
          authResponse.user!.id,
          {
            'email': email,
            'name': name,
            'provider': 'apple',
            'type': 'visitor',
            'status': 'active',
          },
        );

        Preference preference = await Preference.getInstance();
        await preference.setUserUUID(authResponse.user!.id);

        await navigateAfterLogin();
      } else {
        Utils.showToast('Échec de la connexion Apple');
      }
    } catch (e) {
      debugPrint('socialSignInApple error: $e');
      Utils.showToast(e.toString());
    }
    setState(() {
      loader = false;
    });
  }

  Future<void> socialSignInGoogle(Map<String, dynamic> googleData) async {
    setState(() {
      loader = true;
    });

    try {
      final idToken = googleData['idToken'] as String?;
      if (idToken == null || idToken.isEmpty) {
        throw Exception('Google idToken manquant');
      }

      // Authentification directe via OAuth token Supabase
      final authResponse =
          await SupabaseService.instance.signInWithGoogle(idToken);

      if (authResponse.user != null) {
        // Créer/mettre à jour le profil utilisateur dans la table users
        await SupabaseService.instance.updateUserProfile(
          authResponse.user!.id,
          {
            'email': googleData['email'] ?? authResponse.user!.email ?? '',
            'name': googleData['displayName'] ?? '',
            'provider': 'google',
            'type': 'visitor',
            'status': 'active',
          },
        );

        Preference preference = await Preference.getInstance();
        await preference.setUserUUID(authResponse.user!.id);

        await navigateAfterLogin();
      } else {
        Utils.showToast('Échec de la connexion Google');
      }
    } catch (e) {
      debugPrint('socialSignInGoogle error: $e');
      Utils.showToast(e.toString());
    }
    setState(() {
      loader = false;
    });
  }

  // ── Navigation post-login via profil Supabase ───────────────────────
  Future<void> navigateAfterLogin() async {
    final currentUser = SupabaseService.instance.currentUser;
    if (currentUser == null) return;

    // Sauver le token Supabase dans les prefs pour compatibilité legacy
    final session = SupabaseService.instance.currentSession;
    final preference = await Preference.getInstance();
    if (session != null) {
      preference.setToken(session.accessToken);
    }

    // Charger et sélectionner le salon actif AVANT la navigation
    await _autoSelectSalon();

    final profile = await SupabaseService.instance.getUserProfile(currentUser.id);
    final String userType = profile?['type'] ?? 'visitor';
    if (!mounted) return;
    if (userType == 'admin' || userType == 'agent') {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => AgentHomePage(Const.homeUI)),
        (route) => false,
      );
    } else {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => HomePage(Const.homeUI)),
        (route) => false,
      );
    }
  }

  /// Charge le salon par défaut (is_default=true ou premier actif) et le définit dans ActiveSalon.
  Future<void> _autoSelectSalon() async {
    try {
      final salons = await SupabaseService.instance.getSalonsAll();
      if (salons.isEmpty) return;
      // Préférer le salon marqué par défaut, sinon le premier actif, sinon le premier
      Map<String, dynamic>? selected;
      selected = salons.firstWhere(
        (s) => s['is_default'] == true,
        orElse: () => salons.firstWhere(
          (s) => s['is_active'] == true,
          orElse: () => salons.first,
        ),
      );
      ActiveSalon.set(selected);
    } catch (_) {
      // Silencieux — la HomePage gère l'absence de salon
    }
  }

  // Kept for legacy callers (social logins)
  Future<void> getAuthRole() async {
    await navigateAfterLogin();
  }

  void setUser(LinkedInUserModel u) {
    setState(() {
      user = UserObject(
        firstName: u.givenName ?? 'N/A',
        lastName: u.familyName ?? 'N/A',
        email: u.email ?? 'N/A',
        profileImageUrl: u.picture ?? 'N/A',
      );
      socialSignInLinkedIn(user!);
      user = null;
      logoutUser = true;
    });
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
      title: 'SIB',
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
                  'assets/ic_login.svg',
                  height: 120,
                ),
                SizedBox(height: 50.0),
                Center(
                    child: Container(
                        margin: EdgeInsets.fromLTRB(20, 20, 20, 0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10.0),
                          color: Colors.white,
                        ),
                        child: Padding(
                            padding: EdgeInsets.fromLTRB(20.0, 20, 20, 0),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Container(
                                  decoration: BoxDecoration(
                                    color: Color.fromRGBO(249, 249, 255, 1),
                                    borderRadius: BorderRadius.circular(30.0),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(30.0),
                                    child: LinkedInCustomButton(
                                      config: config,
                                      destroySession: true,
                                      onError: (error) =>
                                          log('Error: ${error.message}'),
                                      onGetAuthToken: (data) => log(
                                          'Access token ${data.accessToken!}'),
                                      onGetUserProfile: setUser,
                                      child: Container(
                                        height: 52,
                                        width: 295,
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                          color:
                                              Color.fromRGBO(249, 249, 255, 1),
                                          borderRadius:
                                              BorderRadius.circular(50.0),
                                        ),
                                        padding: EdgeInsets.all(10.0),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
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
                                                  fontWeight: FontWeight.w400,
                                                  color:
                                                      ThemeColor.textPrimary),
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
                                    final googleData = await _handleSignIn();
                                    if (googleData != null) {
                                      // Successfully signed in with Google
                                      socialSignInGoogle(googleData);
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
                                      color: Color.fromRGBO(249, 249, 255, 1),
                                      borderRadius: BorderRadius.circular(30.0),
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
                                          Intl.message("connect_with_google",
                                              name: "connect_with_google"),
                                          style: GoogleFonts.roboto(
                                              fontSize: 20.0,
                                              fontWeight: FontWeight.w400,
                                              color: ThemeColor.textPrimary),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                SizedBox(height: 10),
                                if (Platform.isIOS)
                                  SignInWithAppleButton(
                                    text: Intl.message("connect_with_apple",
                                        name: "connect_with_apple"),
                                    onPressed: () async {
                                      final credential = await SignInWithApple
                                          .getAppleIDCredential(
                                        scopes: [
                                          AppleIDAuthorizationScopes.email,
                                          AppleIDAuthorizationScopes.fullName,
                                        ],
                                      );

                                      socialSignInApple(credential);
                                    },
                                  ),
                                SizedBox(height: 10),
                                Center(
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      SizedBox(width: 30),
                                      Expanded(
                                        child: Divider(
                                          color:
                                              Color.fromRGBO(132, 130, 130, 1),
                                          thickness: 1.0,
                                        ),
                                      ),
                                      Padding(
                                        padding: EdgeInsets.symmetric(
                                            horizontal: 16.0),
                                        child: Text(
                                          Intl.message("or", name: "or"),
                                          style: GoogleFonts.roboto(
                                              fontSize: 18.0,
                                              fontWeight: FontWeight.w400,
                                              color: Color.fromRGBO(
                                                  132, 130, 130, 1)),
                                        ),
                                      ),
                                      Expanded(
                                        child: Divider(
                                          color:
                                              Color.fromRGBO(132, 130, 130, 1),
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
                                  width: 295,
                                  child: TextFormField(
                                    controller: _emailController,
                                    focusNode: _emailFocus,
                                    onEditingComplete: () {
                                      _passwordFocus.requestFocus();
                                    },
                                    maxLines: 1,
                                    keyboardType: TextInputType.emailAddress,
                                    decoration: InputDecoration(
                                      labelText:
                                          Intl.message("email", name: "email"),
                                      border: OutlineInputBorder(
                                        borderSide: BorderSide.none,
                                        borderRadius:
                                            BorderRadius.circular(25.0),
                                      ),
                                      contentPadding: EdgeInsets.zero,
                                      fillColor:
                                          Color.fromRGBO(249, 249, 255, 1),
                                      filled: true,
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
                                SizedBox(height: 16.0),
                                SizedBox(
                                  height: 52,
                                  child: TextFormField(
                                    focusNode: _passwordFocus,
                                    onEditingComplete: () {
                                      if (checkValidations()) signIn();
                                    },
                                    maxLines: 1,
                                    controller: _passwordController,
                                    obscureText: !_isPasswordVisible,
                                    decoration: InputDecoration(
                                      contentPadding: EdgeInsets.zero,
                                      labelText: Intl.message("password",
                                          name: "password"),
                                      border: OutlineInputBorder(
                                        borderSide: BorderSide.none,
                                        borderRadius:
                                            BorderRadius.circular(25.0),
                                      ),
                                      filled: true,
                                      fillColor:
                                          Color.fromRGBO(249, 249, 255, 1),
                                      floatingLabelBehavior:
                                          FloatingLabelBehavior.never,
                                      prefixIcon: Padding(
                                          padding: EdgeInsets.symmetric(
                                              horizontal: 19),
                                          child: SvgPicture.asset(
                                              'assets/ic_password.svg')),
                                      prefixIconConstraints:
                                          BoxConstraints.tightForFinite(
                                              width: 55, height: 55),
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _isPasswordVisible
                                              ? Icons.visibility_off_outlined
                                              : Icons.visibility_outlined,
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
                                              Color.fromRGBO(69, 152, 209, 1),
                                          // Set the background color to black
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                                25.0), // Set the border radius
                                          ),
                                        ),
                                        onPressed: () async {
                                          if (checkValidations()) signIn();
                                        },
                                        child: Text(
                                            Intl.message("sign_in",
                                                name: "sign_in"),
                                            style: GoogleFonts.roboto(
                                                color: Colors.white,
                                                fontSize: 20,
                                                fontWeight: FontWeight.w500)))),
                                Center(
                                    child: TextButton(
                                        onPressed: () async {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                                builder: (context) =>
                                                    ForgotPassword()),
                                          );
                                        },
                                        child: Text(
                                            Intl.message("forgot_password",
                                                name: "forgot_password"),
                                            style: GoogleFonts.roboto(
                                                color: Color.fromRGBO(
                                                    235, 154, 68, 1),
                                                fontStyle: FontStyle.normal,
                                                fontSize: 16,
                                                fontWeight: FontWeight.w400)))),
                                SizedBox(
                                  height: 20,
                                )
                              ],
                            )))),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                        Intl.message("you_dont_have_account",
                            name: "you_dont_have_account"),
                        style: GoogleFonts.roboto(
                            color: Colors.black,
                            fontStyle: FontStyle.normal,
                            fontSize: 16,
                            fontWeight: FontWeight.w500)),
                    TextButton(
                        onPressed: () async {
                          Navigator.push(
                            context,
                            PageRouteBuilder(
                              pageBuilder:
                                  (context, animation, secondaryAnimation) =>
                                      SignUp(),
                              transitionsBuilder: (context, animation,
                                  secondaryAnimation, child) {
                                const begin =
                                    Offset(1.0, 0.0); // Slide from right
                                const end = Offset.zero;
                                const curve = Curves.easeInOut;
                                var tween = Tween(begin: begin, end: end)
                                    .chain(CurveTween(curve: curve));
                                var offsetAnimation = animation.drive(tween);
                                return SlideTransition(
                                    position: offsetAnimation, child: child);
                              },
                            ),
                          );
                        },
                        child: Text(Intl.message("sign_up", name: "sign_up"),
                            style: GoogleFonts.roboto(
                                color: Color.fromRGBO(235, 154, 68, 1),
                                fontStyle: FontStyle.normal,
                                fontSize: 16,
                                fontWeight: FontWeight.w500))),
                  ],
                ),
              ],
            ),
          ),
          CustomToolbar(Intl.message("sign_in", name: "sign_in"),
              handleCallback, -1, false),
          if (loader) Progressbar(loader),
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
