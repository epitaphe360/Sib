import 'dart:convert';
import 'dart:io';

import 'package:com.urbaevent/model/agent/ResponseGateList.dart';
import 'package:com.urbaevent/ui/content_ui/agent/MyScans.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:com.urbaevent/utils/LanguageProvider.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';
import 'package:com.urbaevent/model/common/ResponseUser.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CircularImageUserView.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';

class Profile extends StatefulWidget {
  final Function(int) callback;

  final title;
  final subtitle;
  final ResponseUser? responseUser;

  Profile(this.title, this.subtitle, this.callback, this.responseUser);

  @override
  State<StatefulWidget> createState() => _Profile();
}

class _Profile extends State<Profile> {
  bool loader = false;
  ImagePicker? picker;
  String imagePath = "";
  File? imageFile;
  String stringPicUrl = "";
  String selectedValue = 'Option 1';
  String selectedLang = "";
  int role = 1;
  final List<String> languageList = [
    'French',
    'English',
  ];
  int langPosition = 0;

  TextEditingController _oldPasswordController = TextEditingController();
  TextEditingController _passwordController = TextEditingController();
  TextEditingController _cnfPasswordController = TextEditingController();

  final GlobalKey _anchorKey = GlobalKey();
  final GlobalKey _anchorKey2 = GlobalKey();
  OverlayEntry? _overlayEntry;
  OverlayEntry? _overlayEntr2;
  bool isExpanded = false;
  double dialogHeight = 180;
  bool isPicDeleted = false;

  int _selectedIndex = -1; // Index of the selected item

  List<GateItem> gateList = [];

  Future<void> checkRoleAndLanguage() async {
    Preference preference = await Preference.getInstance();

    role = preference.getAuthRole()!.role!.id!;
    setState(() {
      if (preference.getLanguage() == "fr") {
        selectedLang = "French";
        langPosition = 0;
      } else {
        selectedLang = "English";
        langPosition = 1;
      }
    });

    if (_selectedIndex == -1) {
      _selectedIndex = 0;
    }
    if (preference.getAuthRoleAgent() != null) {
      setState(() {
        gateList = preference.getGateListResponse()!.data!;
        for (int i = 0; i < gateList.length; i++) {
          if (preference.getGateItem()!.name! == gateList[i].name!) {
            _selectedIndex = i;
          }
        }
      });
    }
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

  void updatePicFileIdAndDelete(int newPicFileId) {
    setState(() {
      Const.picId = newPicFileId;
    });
  }

  Future<void> deleteProfilePic(int picId) async {
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();

    if (jwtToken.isNotEmpty) {
      setState(() {
        loader = true;
      });

      final url =
          Uri.parse(Urls.baseURL + Urls.deleteAvatar+picId.toString());
      final response = await http.delete(
        url,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      print(url.toString());

      final parsedJson = jsonDecode(response.body);
      if (response.statusCode == HttpStatus.ok) {
        setState(() {
          imageFile = null;
          stringPicUrl = "";
          isPicDeleted = true;
        });
      } else if (response.statusCode == HttpStatus.unauthorized) {
        setState(() {
          preference.clearAppPreferences();
        });
      } else {
        print('Response Error' + response.body);
        final error = ResponseError.fromJson(parsedJson);
        Utils.showToast(error.error.message);
      }
    } else {
      setState(() {
        loader = false;
      });
    }
  }

  Future<void> _showAnchoredDialog(
      BuildContext context, Offset anchorOffset) async {
    final OverlayState overlayState = Overlay.of(context);
    final Preference preference = await Preference.getInstance();

    _overlayEntr2 = OverlayEntry(
      builder: (BuildContext context) {
        return Stack(
          children: [
            GestureDetector(
              onTap: () {
                setState(() {
                  isExpanded = false;
                });
                _overlayEntr2?.remove();
              },
              child: Container(
                color: Colors.transparent, // Background dim effect
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height,
              ),
            ),
            Positioned(
              left: 16,
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
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.all(Radius.circular(10))),
                      width: MediaQuery.of(context).size.width - 32,
                      height: 160,
                      child: ListView.builder(
                        padding: EdgeInsets.only(top: 10),
                        itemCount:
                            preference.getGateListResponse()!.data!.length,
                        itemBuilder: (BuildContext context, int index) {
                          return GestureDetector(
                            onTap: () {
                              setState(() async {
                                isExpanded = false;
                                _selectedIndex = index;
                                Preference preference =
                                    await Preference.getInstance();
                                preference.saveGate(gateList[_selectedIndex]);
                                _overlayEntr2?.remove();
                              });
                            },
                            child: Container(
                              height: 40.0,
                              color: _selectedIndex == index
                                  ? Color.fromRGBO(
                                      69, 152, 209, 0.15) // Highlighted color
                                  : Colors.transparent,
                              child: Align(
                                alignment: Alignment.centerLeft,
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 20.0),
                                  child: Row(
                                    children: [
                                      Text(
                                        preference
                                            .getGateListResponse()!
                                            .data![index]
                                            .name!,
                                        style: GoogleFonts.roboto(
                                            color: ThemeColor.textPrimary,
                                            fontStyle: FontStyle.normal,
                                            fontSize: 18,
                                            fontWeight: FontWeight.w400),
                                      ),
                                    ],
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

    overlayState.insert(_overlayEntr2!);
  }

  void _showAnchoredLangDialog(BuildContext context, Offset anchorOffset) {
    final OverlayState overlayState = Overlay.of(context);
    _overlayEntry = OverlayEntry(
      builder: (BuildContext context) {
        final languageProvider = Provider.of<LanguageProvider>(context);
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
              left: 16,
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
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.all(Radius.circular(10))),
                      width: MediaQuery.of(context).size.width - 32,
                      height: 150,
                      child: ListView.builder(
                        padding: EdgeInsets.only(top: 10),
                        itemCount: languageList.length,
                        itemBuilder: (BuildContext context, int index) {
                          return GestureDetector(
                            onTap: () {
                              setState(() async {
                                isExpanded = false;
                                selectedLang = languageList[index];
                                langPosition = index;
                                _overlayEntry?.remove();
                                Preference preference =
                                    await Preference.getInstance();
                                if (selectedLang == "English") {
                                  preference.setLanguage('en');
                                  languageProvider
                                      .changeLanguage(Locale('en', ''));
                                } else {
                                  preference.setLanguage('fr');
                                  languageProvider
                                      .changeLanguage(Locale('fr', ''));
                                }
                              });
                            },
                            child: Container(
                              height: 60.0,
                              color: selectedLang == languageList[index]
                                  ? Color.fromRGBO(
                                      69, 152, 209, 0.15) // Highlighted color
                                  : Colors.transparent,
                              child: Align(
                                alignment: Alignment.centerLeft,
                                child: Row(
                                  children: [
                                    SizedBox(
                                      width: 15,
                                    ),
                                    Center(
                                      child: Stack(
                                        alignment: Alignment.center,
                                        children: [
                                          SvgPicture.asset(
                                            "assets/ic_bg_lang.svg",
                                          ),
                                          if (index == 0)
                                            SvgPicture.asset(
                                              "assets/ic_france.svg",
                                            ),
                                          if (index == 1)
                                            SvgPicture.asset(
                                              "assets/ic_lang_english.svg",
                                            ),
                                        ],
                                      ),
                                    ),
                                    SizedBox(
                                      width: 10,
                                    ),
                                    Text(
                                      languageList[index],
                                      style: GoogleFonts.roboto(
                                          color: ThemeColor.textPrimary,
                                          fontStyle: FontStyle.normal,
                                          fontSize: 18,
                                          fontWeight: FontWeight.w400),
                                    ),
                                    SizedBox(
                                      width: 20,
                                    ),
                                  ],
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
              height: dialogHeight,
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
                  if (widget.responseUser!.avatar != null && !isPicDeleted)
                    TextButton(
                      onPressed: () async {
                        Navigator.pop(context);
                        if (Const.picId != 0) {
                          Future.microtask(() {
                            deleteProfilePic(Const.picId);
                          });
                        }
                      },
                      child: Text(
                        Intl.message("delete_pic", name: "delete_pic"),
                        style: GoogleFonts.roboto(
                            color: Colors.red,
                            fontStyle: FontStyle.normal,
                            fontSize: 20,
                            fontWeight: FontWeight.w500),
                      ),
                    ),
                  if (widget.responseUser!.avatar != null)
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

  Future<void> _uploadImage() async {
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();
    final url = Urls.baseURL + Urls.uploadPic;

    var request = http.MultipartRequest(
        'POST',
        Uri.parse(
          url,
        ));

    request.headers['Authorization'] = 'Bearer $jwtToken';

    request.files.add(
      await http.MultipartFile.fromPath(
        'files',
        imageFile!.path,
      ),
    );

    // Add other form fields if needed
    request.fields['refId'] = preference.getLoginDetails()!.user.id.toString();

    request.fields['ref'] = 'plugin::users-permissions.user';

    request.fields['field'] = 'avatar';

    final response = await request.send();

    if (response.statusCode == 200) {
      isPicDeleted = false;
      getUserDetails();
      Utils.showToast(
          Intl.message("msg_pic_uploaded", name: "msg_pic_uploaded"));
    } else {
      Utils.showToast(Intl.message("msg_pic_failure", name: "msg_pic_failure"));
    }
  }

  Future<void> getUserDetails() async {
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();

    if (jwtToken.isNotEmpty) {
      String os;
      final info = await PackageInfo.fromPlatform();
      if (Platform.isAndroid) {
        os = "android";
      } else {
        os = "ios";
      }

      FirebaseMessaging messaging = FirebaseMessaging.instance;
      String? fcmToken = await messaging.getToken();

      final url = Uri.parse(Urls.baseURL + Urls.userDetails);

      // Add parameters to the URL
      // Add parameters to the URL
      final Map<String, String> params = {
        'populate[role]': true.toString(),
        'populate[avatar]': true.toString(),
        'populate[businessSector]': true.toString(),
        'os': os,
        'appVersion': info.version,
        'fcm': fcmToken ?? ""
      };
      final Uri uriWithParams = url.replace(queryParameters: params);
      final response = await http.get(
        uriWithParams,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      final parsedJson = jsonDecode(response.body);

      print('Response User' + response.body);

      if (response.statusCode == HttpStatus.ok) {
        var _responseUser = ResponseUser.fromJson(parsedJson);
        setState(() {
          Const.picId = _responseUser.avatar!.id;
        });
      } else if (response.statusCode == HttpStatus.unauthorized) {
        setState(() {
          preference.clearAppPreferences();
        });
      } else {
        print('Response Error' + response.body);
        final error = ResponseError.fromJson(parsedJson);
        Utils.showToast(error.error.message);
      }
    }
  }

  Future<void> funPickCameraImage() async {
    picker = ImagePicker();
    final XFile? photo = await picker!.pickImage(source: ImageSource.camera);
    imagePath = photo!.path;
    setState(() {
      imageFile = File(imagePath);
    });
    _uploadImage();
  }

  Future<void> funPickGalleryImage() async {
    picker = ImagePicker();
    final XFile? photo = await picker!.pickImage(source: ImageSource.gallery);
    imagePath = photo!.path;
    setState(() {
      imageFile = File(imagePath);
    });
    _uploadImage();
  }

  @override
  void initState() {
    super.initState();
    if (widget.responseUser != null) {
      if (widget.responseUser!.avatar == null) {
        stringPicUrl = Urls.imageURL;
        dialogHeight = 180;
      } else {
        Const.picId = widget.responseUser!.avatar!.id;
        dialogHeight = 230;
        stringPicUrl = Urls.imageURL + widget.responseUser!.avatar!.url;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    checkRoleAndLanguage();



    String userRole = " ";
    if (widget.responseUser!.role != null) {
      userRole = widget.responseUser!.role!.name;
    }

    return Expanded(
      flex: 1,
      child: SingleChildScrollView(
        child: Container(
          child: Padding(
            padding: EdgeInsets.only(left: 16, right: 16, top: 5),
            child: Column(
              children: [
                if (widget.responseUser != null)
                  Container(
                    height: 180,
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.all(Radius.circular(10))),
                    width: MediaQuery.of(context).size.width,
                    child: Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      shadowColor:
                          Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                      child: Container(
                        decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(10))),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(height: 25),
                            Column(children: [
                              SizedBox(width: 10),
                              Stack(
                                children: [
                                  if (imageFile == null && !isPicDeleted)
                                    GestureDetector(
                                      onTap: () {
                                        _showImagePickerDialog();
                                      },
                                      child: CircularImageView(
                                        imageUrl: stringPicUrl,
                                        radius: 30,
                                      ),
                                    ),
                                  if (imageFile != null && !isPicDeleted)
                                    GestureDetector(
                                        onTap: () {
                                          _showImagePickerDialog();
                                        },
                                        child: ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(30),
                                          // Set the border radius here
                                          child: Image.file(
                                            imageFile!,
                                            height: 60,
                                            width: 60,
                                            fit: BoxFit.cover,
                                          ),
                                        )),
                                  if (isPicDeleted)
                                    GestureDetector(
                                      onTap: () {
                                        _showImagePickerDialog();
                                      },
                                      child: CircleAvatar(
                                        radius: 30,
                                        backgroundColor: Colors.white,
                                        child: Center(
                                          child: Stack(
                                            alignment: Alignment.center,
                                            children: [
                                              SvgPicture.asset(
                                                "assets/ic_user.svg",
                                                width: 30 * 2,
                                              ),
                                              SvgPicture.asset(
                                                "assets/ic_user_avatar.svg",
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  Positioned(
                                    bottom: 0,
                                    right: 0,
                                    child: GestureDetector(
                                      onTap: () {
                                        _showImagePickerDialog();
                                      },
                                      child: SvgPicture.asset(
                                          'assets/ic_edit_photo.svg'),
                                    ),
                                  )
                                ],
                              ),
                              SizedBox(height: 15),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    widget.responseUser!.name,
                                    style: GoogleFonts.roboto(
                                        color: ThemeColor.textPrimary,
                                        fontStyle: FontStyle.normal,
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700),
                                  ),
                                  SizedBox(
                                    height: 5,
                                  ),
                                  Text(
                                    userRole,
                                    style: GoogleFonts.roboto(
                                        color: Color.fromRGBO(69, 152, 209, 1),
                                        fontStyle: FontStyle.normal,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500),
                                  ),
                                  SizedBox(
                                    height: 20,
                                  ),
                                ],
                              ),
                            ]),
                          ],
                        ),
                      ),
                    ),
                  ),
                SizedBox(
                  height: 20,
                ),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      widget.callback(1);
                    });
                  },
                  child: Container(
                    height: 70,
                    width: MediaQuery.of(context).size.width,
                    child: Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      shadowColor:
                          Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                      child: Container(
                        decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(10))),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 16,
                            ),
                            CircularImageView(
                              imageUrl: 'https://demo.com',
                              radius: 20,
                            ),
                            SizedBox(width: 10),
                            Text(
                              Intl.message("information", name: "information"),
                              style: GoogleFonts.roboto(
                                  color: ThemeColor.textPrimary,
                                  fontStyle: FontStyle.normal,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w400),
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
                if (role == 3)
                  GestureDetector(
                    onTap: () {
                      final RenderBox renderBox = _anchorKey.currentContext!
                          .findRenderObject() as RenderBox;
                      final anchorPosition =
                          renderBox.localToGlobal(Offset.zero);
                      _showAnchoredDialog(context, anchorPosition);
                      setState(() {
                        isExpanded = true;
                      });
                    },
                    child: Container(
                      key: _anchorKey,
                      height: 70,
                      width: MediaQuery.of(context).size.width,
                      child: Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        shadowColor:
                            Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                        surfaceTintColor: Colors.white,
                        child: Container(
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(10))),
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
                                      SvgPicture.asset(
                                        "assets/ic_grey.svg",
                                      ),
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
                                Expanded(
                                  flex: 1,
                                  child: Text(
                                    gateList[_selectedIndex].name!,
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
                    ),
                  ),
                if (role == 3)
                  SizedBox(
                    height: 10,
                  ),
                if (role == 3)
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        PageRouteBuilder(
                          pageBuilder:
                              (context, animation, secondaryAnimation) =>
                                  MyScans(),
                          transitionsBuilder:
                              (context, animation, secondaryAnimation, child) {
                            const begin = Offset(1.0, 0.0); // Slide from right
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
                    child: Container(
                      height: 70,
                      width: MediaQuery.of(context).size.width,
                      child: Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        shadowColor:
                            Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                        child: Container(
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(10))),
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
                                      SvgPicture.asset(
                                        "assets/ic_grey.svg",
                                      ),
                                      Image.asset(
                                        "assets/icon_scanner.png",
                                        height: 24,
                                        width: 24,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              SizedBox(width: 10),
                              Expanded(
                                flex: 1,
                                child: Text(
                                  Intl.message("my_scans", name: "my_scans"),
                                  style: GoogleFonts.roboto(
                                      color: ThemeColor.textPrimary,
                                      fontStyle: FontStyle.normal,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w400),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                if (role == 3)
                  SizedBox(
                    height: 10,
                  ),
                if (widget.responseUser!.socialId == null)
                  GestureDetector(
                    onTap: () {
                      _showChangePasswordDialog();
                    },
                    child: Container(
                      height: 70,
                      width: MediaQuery.of(context).size.width,
                      child: Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        shadowColor:
                            Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                        child: Container(
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(10))),
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
                                      SvgPicture.asset(
                                        "assets/ic_password_change.svg",
                                      ),
                                      SvgPicture.asset(
                                        "assets/ic_lock.svg",
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              SizedBox(width: 10),
                              Text(
                                Intl.message("change_password",
                                    name: "change_password"),
                                style: GoogleFonts.roboto(
                                    color: ThemeColor.textPrimary,
                                    fontStyle: FontStyle.normal,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w400),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                if (widget.responseUser!.socialId == null)
                  SizedBox(
                    height: 10,
                  ),
                GestureDetector(
                  onTap: () {
                    final RenderBox renderBox = _anchorKey2.currentContext!
                        .findRenderObject() as RenderBox;
                    final anchorPosition = renderBox.localToGlobal(Offset.zero);
                    _showAnchoredLangDialog(context, anchorPosition);
                  },
                  child: Container(
                    key: _anchorKey2,
                    height: 70,
                    width: MediaQuery.of(context).size.width,
                    child: Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      shadowColor:
                          Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                      child: Container(
                        decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(10))),
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
                                    SvgPicture.asset(
                                      "assets/ic_bg_lang.svg",
                                    ),
                                    if (langPosition == 0)
                                      SvgPicture.asset(
                                        "assets/ic_france.svg",
                                      ),
                                    if (langPosition == 1)
                                      SvgPicture.asset(
                                        "assets/ic_lang_english.svg",
                                      ),
                                  ],
                                ),
                              ),
                            ),
                            SizedBox(width: 10),
                            Expanded(
                              flex: 1,
                              child: Text(
                                selectedLang,
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
                  ),
                ),
                SizedBox(
                  height: 10,
                ),
                GestureDetector(
                  onTap: () {
                    widget.callback(3);
                  },
                  child: Container(
                    height: 70,
                    width: MediaQuery.of(context).size.width,
                    child: Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      shadowColor:
                          Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                      child: Container(
                        decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.all(Radius.circular(10))),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 16,
                            ),
                            SvgPicture.asset(
                              "assets/ic_logout.svg",
                            ),
                            SizedBox(width: 10),
                            Text(
                              Intl.message("logout", name: "logout"),
                              style: GoogleFonts.roboto(
                                  color: ThemeColor.textPrimary,
                                  fontStyle: FontStyle.normal,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w400),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
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
          return PasswordVisibilityDialog(loader, _oldPasswordController,
              _passwordController, _cnfPasswordController);
        });
  }
}

class PasswordVisibilityDialog extends StatefulWidget {
  final bool loader;

  final TextEditingController _oldPasswordController;
  final TextEditingController _passwordController;
  final TextEditingController _cnfPasswordController;

  PasswordVisibilityDialog(this.loader, this._oldPasswordController,
      this._passwordController, this._cnfPasswordController);

  @override
  _PasswordVisibilityDialogState createState() =>
      _PasswordVisibilityDialogState();
}

class _PasswordVisibilityDialogState extends State<PasswordVisibilityDialog> {
  Future<void> changePassword() async {
    setState(() {
      _isOldPasswordVisible = false;
    });
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();
    final url = Uri.parse(Urls.baseURL + Urls.changePwd);
    final response = await http.post(
      url,
      headers: {'Authorization': 'Bearer $jwtToken'},
      body: {
        'currentPassword': widget._oldPasswordController.value.text,
        'password': widget._passwordController.value.text,
        'passwordConfirmation': widget._cnfPasswordController.value.text
      },
    );

    final parsedJson = jsonDecode(response.body);

    if (response.statusCode == HttpStatus.ok) {
      Utils.showToast(Intl.message("msg_pwd_changed", name: "msg_pwd_changed"));
      Navigator.pop(context);
    } else {
      final error = ResponseError.fromJson(parsedJson);
      Utils.showToast(error.error.message);
    }
    setState(() {
      _isPasswordVisible = false;
    });
  }

  bool _isOldPasswordVisible = false;
  bool _isPasswordVisible = false;
  bool _isNewPasswordVisible = false;
  FocusNode focusOld = FocusNode();
  FocusNode focusNew = FocusNode();
  FocusNode focusCnf = FocusNode();

  bool checkValidations() {
    if (widget._oldPasswordController.value.text.length < 5) {
      Utils.showToast(
          Intl.message("msg_old_pwd_empty", name: "msg_old_pwd_empty"));
      return false;
    } else if (widget._passwordController.value.text.length < 5) {
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
              height: 50,
            ),
            SizedBox(
              height: 52,
              width: 330,
              child: TextFormField(
                focusNode: focusOld,
                onEditingComplete: () {
                  focusNew.requestFocus();
                },
                controller: widget._oldPasswordController,
                obscureText: !_isOldPasswordVisible,
                style: GoogleFonts.roboto(
                    fontSize: 18.0,
                    fontWeight: FontWeight.w400,
                    color: Colors.black),
                decoration: InputDecoration(
                  hintStyle: TextStyle(
                      color: Color.fromRGBO(132, 130, 130, 0.8745098039215686)),
                  labelText: Intl.message("old_pwd", name: "old_pwd"),
                  border: OutlineInputBorder(
                    borderSide: BorderSide.none,
                    borderRadius: BorderRadius.circular(25.0),
                  ),
                  filled: true,
                  fillColor: Color.fromRGBO(249, 249, 255, 0.67),
                  floatingLabelBehavior: FloatingLabelBehavior.never,
                  contentPadding: EdgeInsets.symmetric(horizontal: 20),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isOldPasswordVisible
                          ? Icons.visibility_off
                          : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        _isOldPasswordVisible = !_isOldPasswordVisible;
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
                  labelText: Intl.message("cnf_password", name: "cnf_password"),
                  border: OutlineInputBorder(
                    borderSide: BorderSide.none,
                    borderRadius: BorderRadius.circular(25.0),
                  ),
                  filled: true,
                  fillColor: Color.fromRGBO(249, 249, 255, 0.67),
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
                    changePassword();
                  }
                },
                controller: widget._cnfPasswordController,
                obscureText: !_isNewPasswordVisible,
                style: GoogleFonts.roboto(
                    fontSize: 18.0,
                    fontWeight: FontWeight.w400,
                    color: Colors.black),
                decoration: InputDecoration(
                  labelText: Intl.message("confirm_new_password",
                      name: "confirm_new_password"),
                  hintStyle: TextStyle(
                      color: Color.fromRGBO(132, 130, 130, 0.8745098039215686)),
                  border: OutlineInputBorder(
                    borderSide: BorderSide.none,
                    borderRadius: BorderRadius.circular(25.0),
                  ),
                  filled: true,
                  contentPadding: EdgeInsets.symmetric(horizontal: 20),
                  fillColor: Color.fromRGBO(249, 249, 255, 0.67),
                  floatingLabelBehavior: FloatingLabelBehavior.never,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _isNewPasswordVisible
                          ? Icons.visibility_off
                          : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        _isNewPasswordVisible = !_isNewPasswordVisible;
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
                    onPressed: () {
                      if (checkValidations()) {
                        changePassword();
                      }
                    },
                    child: Text(Intl.message("update_pwd", name: "update_pwd"),
                        style: GoogleFonts.roboto(
                            color: Color.fromRGBO(69, 152, 209, 1),
                            fontSize: 16,
                            fontWeight: FontWeight.w700)))),
            SizedBox(
              height: 50,
            )
          ],
        ),
      ),
    );
  }
}
