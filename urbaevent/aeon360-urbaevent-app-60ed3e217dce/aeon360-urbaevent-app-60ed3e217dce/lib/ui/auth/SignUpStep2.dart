import 'dart:io';
import 'dart:math';

import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/ui/content_ui/home/SalonListPage.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher_string.dart';
import 'SignIn.dart';

class SignUpStep2 extends StatefulWidget {
  final String name;
  final String phone;
  final String email;
  final String password;
  final String socialId;
  final String provider;
  final File? imageFile;

  SignUpStep2(this.name, this.phone, this.email, this.password, this.socialId,
      this.provider, this.imageFile);

  @override
  State<StatefulWidget> createState() => _SignUpStep2();
}

class _SignUpStep2 extends State<SignUpStep2> {
  bool loader = false;
  ImagePicker? picker;
  String imagePath = "";
  File? imageFile;

  TextEditingController _companyController = TextEditingController();
  TextEditingController _businessSectorController = TextEditingController();
  TextEditingController _functionController = TextEditingController();
  TextEditingController _countryController = TextEditingController();

  final FocusNode _companyFocus = FocusNode();
  final FocusNode _businessFocus = FocusNode();
  final FocusNode _functionFocus = FocusNode();
  final FocusNode _countryFocus = FocusNode();

  String _selectedType = 'visitor'; // visitor, exhibitor, partner

  OverlayEntry? _overlayEntry;
  bool isChecked = false;

  void toggleCheckbox() {
    setState(() {
      isChecked = !isChecked;
    });
  }

  Future<void> redirectToTermsAndCondition() async {
    Preference preference = await Preference.getInstance();
    if (preference.getLanguage().toLowerCase() == "en") {
      await launchUrlString("https://sib2026.ma/terms",
          mode: LaunchMode.externalApplication);
    } else {
      await launchUrlString("https://sib2026.ma/conditions",
          mode: LaunchMode.externalApplication);
    }
  }



  Future<void> _showImagePickerDialog() async {
    return showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
            title: Text(
              Intl.message("select_image", name: "select_image"),
              style: GoogleFonts.roboto(
                  color: ThemeColor.textPrimary,
                  fontStyle: FontStyle.normal,
                  fontSize: 20,
                  fontWeight: FontWeight.w400),
            ),
            content: Container(
              height: 170,
              width: MediaQuery.of(context).size.width,
              alignment: Alignment.topLeft,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context);
                      funPickCameraImage();
                    },
                    child: Text(
                      Intl.message("camera", name: "camera"),
                      style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontStyle: FontStyle.normal,
                          fontSize: 20,
                          fontWeight: FontWeight.w500),
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context);
                      funPickGalleryImage();
                    },
                    child: Text(
                      Intl.message("gallery", name: "gallery"),
                      style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontStyle: FontStyle.normal,
                          fontSize: 20,
                          fontWeight: FontWeight.w500),
                    ),
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    child: Text(
                      Intl.message("cancel", name: "cancel"),
                      style: GoogleFonts.roboto(
                          color: ThemeColor.textSecondary,
                          fontStyle: FontStyle.normal,
                          fontSize: 20,
                          fontWeight: FontWeight.w400),
                    ),
                  ),
                ],
              ),
            ));
      },
    );
  }



  Future<void> funPickCameraImage() async {
    picker = ImagePicker();
    final XFile? photo = await picker!.pickImage(source: ImageSource.camera);
    imagePath = photo!.path;
    setState(() {
      imageFile = File(imagePath);
    });
  }

  Future<void> funPickGalleryImage() async {
    picker = ImagePicker();
    final XFile? photo = await picker!.pickImage(source: ImageSource.gallery);
    imagePath = photo!.path;
    setState(() {
      imageFile = File(imagePath);
    });
  }

  void handleCallback() {
    Navigator.pop(context);
  }

  /*bool checkValidations() {
    if (_companyController.value.text.isEmpty) {
      Utils.showToast(
        Intl.message("msg_valid_company", name: "msg_valid_company"),
      );
      return false;
    } else if (_businessSectorController.value.text.isEmpty) {
      Utils.showToast(
        Intl.message("msg_valid_business_sector",
            name: "msg_valid_business_sector"),
      );
      return false;
    } else if (_functionController.value.text.isEmpty) {
      Utils.showToast(
        Intl.message("msg_valid_function", name: "msg_valid_function"),
      );
      return false;
    } else if (_countryController.value.text.isEmpty) {
      Utils.showToast(
          Intl.message("msg_valid_country", name: "msg_valid_country"));
      return false;
    }
    return true;
  }*/

  String generatePassword(int length) {
    const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    final random = Random();
    String password = "";

    for (int i = 0; i < length; i++) {
      final randomIndex = random.nextInt(charset.length);
      password += charset[randomIndex];
    }

    return password;
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
      home: _buildContent(),
    );
  }

  @override
  void initState() {
    super.initState();
    // getBusinessSector();
    if (widget.imageFile != null) {
      setState(() {
        imageFile = widget.imageFile;
      });
    }
  }

  Widget _buildContent() {
    Future<void> register() async {
      setState(() {
        loader = true;
      });

      Preference preference = await Preference.getInstance();
      try {
        final res = await SupabaseService.instance.signUp(
          email: widget.email,
          password: widget.socialId.isEmpty ? widget.password : generatePassword(8),
          name: widget.name,
          lang: preference.getLanguage(),
        );

        if (res.user != null) {
          preference.setUserUUID(res.user!.id);
          // Sauvegarder le token de session
          final session = SupabaseService.instance.currentSession;
          if (session != null) {
            preference.setToken(session.accessToken);
          }
          // Sauvegarder le profil étendu (entreprise, secteur, type)
          try {
            await SupabaseService.instance.updateUserProfile(res.user!.id, {
              'company': _companyController.text.isNotEmpty ? _companyController.text : null,
              'business_sector': _businessSectorController.text.isNotEmpty ? _businessSectorController.text : null,
              'job_position': _functionController.text.isNotEmpty ? _functionController.text : null,
              'country': _countryController.text.isNotEmpty ? _countryController.text : null,
              'type': _selectedType,
            });
          } catch (_) {}
          // Inscrire au salon actif si sélectionné
          try {
            if (ActiveSalon.id != null) {
              await SupabaseService.instance.registerToSalon(ActiveSalon.id!);
            }
          } catch (_) {}
          if (imageFile != null) {
            final bytes = await imageFile!.readAsBytes();
            await SupabaseService.instance.uploadAvatar(
              'avatars/${res.user!.id}.jpg',
              bytes,
            );
          }
          if (!context.mounted) return;
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => HomePage(Const.homeUI)),
            (route) => false,
          );
        }
      } catch (e) {
        Utils.showToast(Intl.message("email_taken", name: "email_taken"));
        setState(() {
          loader = false;
        });
      }
    }

    final _customToolbar = CustomToolbar(
        Intl.message("sign_up", name: "sign_up"), handleCallback, -1, false);
    return PopScope(
      onPopInvokedWithResult: (bool didPop, _) {
        if (didPop && _overlayEntry != null) _overlayEntry!.remove();
      },
      child: Scaffold(
        appBar: null,
        body: Container(
          color: Color.fromRGBO(249, 249, 255, 1),
          child: Stack(children: [
            SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: Column(
                children: [
                  SizedBox(height: 80.0),
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
                                  SizedBox(height: 16),
                                  Center(
                                    child: Stack(
                                      children: [
                                        if (imageFile == null)
                                          GestureDetector(
                                              onTap: () {
                                                _showImagePickerDialog();
                                              },
                                              child: ClipOval(
                                                child: SvgPicture.asset(
                                                    "assets/ic_user_camer.svg",
                                                    width: 80,
                                                    height: 80),
                                              )),
                                        if (imageFile != null)
                                          GestureDetector(
                                            onTap: () {
                                              _showImagePickerDialog();
                                            },
                                            child: ClipOval(
                                              child: Image.file(
                                                imageFile!,
                                                width: 80,
                                                height: 80,
                                                fit: BoxFit.cover,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                  SizedBox(height: 32),
                                  SizedBox(
                                    height: 52,
                                    child: TextFormField(
                                      focusNode: _companyFocus,
                                      style: GoogleFonts.roboto(
                                          color: ThemeColor.textPrimary,
                                          fontStyle: FontStyle.normal,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w400),
                                      controller: _companyController,
                                      decoration: InputDecoration(
                                        labelText: Intl.message("company",
                                            name: "company"),
                                        border: OutlineInputBorder(
                                          borderSide: BorderSide.none,
                                          borderRadius:
                                              BorderRadius.circular(25.0),
                                        ),
                                        fillColor:
                                            Color.fromRGBO(249, 249, 255, 1),
                                        filled: true,
                                        contentPadding: EdgeInsets.symmetric(
                                            horizontal: 20),
                                        floatingLabelBehavior:
                                            FloatingLabelBehavior.never,
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: 16),
                                  GestureDetector(
                                    onTap: () {
                                      /*final RenderBox renderBox = _anchorKey
                                          .currentContext!
                                          .findRenderObject() as RenderBox;
                                      final anchorPosition =
                                          renderBox.localToGlobal(Offset.zero);
                                      _showAnchoredDialog(
                                          context, anchorPosition);
                                      setState(() {
                                        isExpanded = true;
                                      });*/
                                    },
                                    child: SizedBox(
                                      height: 52,
                                      child: TextFormField(
                                        focusNode: _businessFocus,
                                        enabled: true,
                                        style: GoogleFonts.roboto(
                                            color: ThemeColor.textPrimary,
                                            fontStyle: FontStyle.normal,
                                            fontSize: 16,
                                            fontWeight: FontWeight.w400),
                                        controller: _businessSectorController,
                                        keyboardType:
                                            TextInputType.emailAddress,
                                        decoration: InputDecoration(
                                          labelStyle: TextStyle(
                                              color: Colors.black
                                                  .withValues(alpha: 0.6)),
                                          labelText: Intl.message(
                                              "business_sector",
                                              name: "business_sector"),
                                          border: OutlineInputBorder(
                                            borderSide: BorderSide.none,
                                            borderRadius:
                                                BorderRadius.circular(25.0),
                                          ),
                                          fillColor:
                                              Color.fromRGBO(249, 249, 255, 1),
                                          filled: true,
                                          contentPadding: EdgeInsets.symmetric(
                                              horizontal: 20),
                                          floatingLabelBehavior:
                                              FloatingLabelBehavior.never,
                                        ),
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: 16),
                                  SizedBox(
                                    height: 52,
                                    child: TextFormField(
                                      focusNode: _functionFocus,
                                      style: GoogleFonts.roboto(
                                          color: ThemeColor.textPrimary,
                                          fontStyle: FontStyle.normal,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w400),
                                      controller: _functionController,
                                      onEditingComplete: () {
                                        _countryFocus.requestFocus();
                                      },
                                      keyboardType: TextInputType.emailAddress,
                                      decoration: InputDecoration(
                                        labelText: Intl.message("function",
                                            name: "function"),
                                        border: OutlineInputBorder(
                                          borderSide: BorderSide.none,
                                          borderRadius:
                                              BorderRadius.circular(25.0),
                                        ),
                                        fillColor:
                                            Color.fromRGBO(249, 249, 255, 1),
                                        filled: true,
                                        contentPadding: EdgeInsets.symmetric(
                                            horizontal: 20),
                                        floatingLabelBehavior:
                                            FloatingLabelBehavior.never,
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: 16.0),
                                  SizedBox(
                                    height: 52,
                                    child: TextFormField(
                                      focusNode: _countryFocus,
                                      style: GoogleFonts.roboto(
                                          color: ThemeColor.textPrimary,
                                          fontStyle: FontStyle.normal,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w400),
                                      controller: _countryController,
                                      onEditingComplete: () {
                                        if (isChecked) {
                                          register();
                                        }
                                        // if (checkValidations()) {
                                        //   register();
                                        // }
                                      },
                                      decoration: InputDecoration(
                                        labelText: Intl.message("country",
                                            name: "country"),
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
                                        contentPadding: EdgeInsets.symmetric(
                                            horizontal: 20),
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: 24.0),
                                  // ── Sélection du type de participation ──
                                  Text(
                                    'Je participe en tant que :',
                                    style: GoogleFonts.roboto(
                                      color: ThemeColor.textPrimary,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  SizedBox(height: 12),
                                  _TypeChip(
                                    label: 'Visiteur',
                                    value: 'visitor',
                                    groupValue: _selectedType,
                                    onChanged: (v) => setState(() => _selectedType = v),
                                  ),
                                  _TypeChip(
                                    label: 'Exposant',
                                    value: 'exhibitor',
                                    groupValue: _selectedType,
                                    onChanged: (v) => setState(() => _selectedType = v),
                                    subtitle: 'Soumis à validation',
                                  ),
                                  _TypeChip(
                                    label: 'Partenaire',
                                    value: 'partner',
                                    groupValue: _selectedType,
                                    onChanged: (v) => setState(() => _selectedType = v),
                                    subtitle: 'Soumis à validation',
                                  ),
                                  SizedBox(height: 16.0),
                                  Row(
                                    children: [
                                      SizedBox(width: 10.0),
                                      InkWell(
                                        onTap: toggleCheckbox,
                                        child: Container(
                                          width: 16, // Adjust width as needed
                                          height: 16, // Adjust height as needed
                                          child: isChecked
                                              ? Image.asset(
                                                  'assets/checkbox.png',
                                                  width: 14,
                                                  // Adjust width as needed
                                                  height: 14,
                                                ) // Use your checked image
                                              : Image.asset(
                                                  'assets/square.png',
                                                  width: 14,
                                                  // Adjust width as needed
                                                  height: 14,
                                                  fit: BoxFit.contain,
                                                ), // Use your unchecked image
                                        ),
                                      ),
                                      SizedBox(width: 10.0),
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        mainAxisAlignment:
                                            MainAxisAlignment.start,
                                        children: [
                                          SizedBox(
                                            width: 10,
                                          ),
                                          Text(
                                              Intl.message("tc_label",
                                                  name: "tc_label"),
                                              style: GoogleFonts.roboto(
                                                  color: Colors.black,
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w400)),
                                          GestureDetector(
                                              onTap: () async {
                                                redirectToTermsAndCondition();
                                              },
                                              child: Container(
                                                width: 250,
                                                child: Text(
                                                    Intl.message("tc_text",
                                                        name: "tc_text"),
                                                    maxLines: 2,
                                                    style: GoogleFonts.roboto(
                                                        color: Color.fromRGBO(
                                                            235, 154, 68, 1),
                                                        fontStyle:
                                                            FontStyle.normal,
                                                        fontSize: 16,
                                                        fontWeight:
                                                            FontWeight.w400)),
                                              )),
                                        ],
                                      ),
                                    ],
                                  ),
                                  SizedBox(height: 20.0),
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
                                            if (isChecked) {
                                              register();
                                            } else {
                                              Utils.showToast(Intl.message(
                                                  "msg_check_tc",
                                                  name: "msg_check_tc"));
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
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      SizedBox(
                                        width: 10,
                                      ),
                                      Text(
                                          Intl.message("you_have_account",
                                              name: "you_have_account"),
                                          style: GoogleFonts.roboto(
                                              color: Colors.black,
                                              fontStyle: FontStyle.normal,
                                              fontSize: 16,
                                              fontWeight: FontWeight.w500)),
                                      TextButton(
                                          onPressed: () async {
                                            Navigator.pushReplacement(
                                              context,
                                              MaterialPageRoute(
                                                  builder: (context) =>
                                                      SignIn()),
                                            );
                                          },
                                          child: Text(
                                              Intl.message("login_",
                                                  name: "login_"),
                                              style: GoogleFonts.roboto(
                                                  color: Color.fromRGBO(
                                                      235, 154, 68, 1),
                                                  fontStyle: FontStyle.normal,
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
            _customToolbar,
            if (loader) Progressbar(loader),
          ]),
        ),
      ),
    );
  }
}

/// Radio-style chip pour sélectionner le type de participation
class _TypeChip extends StatelessWidget {
  final String label;
  final String value;
  final String groupValue;
  final ValueChanged<String> onChanged;
  final String? subtitle;

  const _TypeChip({
    required this.label,
    required this.value,
    required this.groupValue,
    required this.onChanged,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final selected = value == groupValue;
    return GestureDetector(
      onTap: () => onChanged(value),
      child: Container(
        margin: EdgeInsets.only(bottom: 8),
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: selected ? ThemeColor.colorAccent.withValues(alpha: 0.1) : Color.fromRGBO(249, 249, 255, 1),
          borderRadius: BorderRadius.circular(25),
          border: Border.all(
            color: selected ? ThemeColor.colorAccent : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: Row(
          children: [
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: selected ? ThemeColor.colorAccent : ThemeColor.textSecondary,
              size: 22,
            ),
            SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.roboto(
                    color: selected ? ThemeColor.colorAccent : ThemeColor.textPrimary,
                    fontSize: 16,
                    fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
                if (subtitle != null)
                  Text(
                    subtitle!,
                    style: GoogleFonts.roboto(
                      color: ThemeColor.textSecondary,
                      fontSize: 12,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
