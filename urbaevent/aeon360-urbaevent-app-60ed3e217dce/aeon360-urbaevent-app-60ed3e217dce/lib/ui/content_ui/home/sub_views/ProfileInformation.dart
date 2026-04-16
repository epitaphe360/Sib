import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/ui/content_ui/agent/AgentHomepage.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:com.urbaevent/widgets/CustomBottomBarAgent.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CircularImageUserView.dart';
import 'package:com.urbaevent/widgets/CustomBottomBar.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class ProfileInformation extends StatefulWidget {
  final title;
  final isMine;
  final avatar;
  final name;
  final company;
  final businessIndustry;
  final email;
  final phoneNumber;
  final isUser;

  ProfileInformation(
      {this.title,
      this.isMine,
      this.avatar,
      this.name,
      this.company,
      this.businessIndustry,
      this.email,
      this.phoneNumber,
      this.isUser});

  @override
  State<StatefulWidget> createState() => _ProfileInformation();
}

class _ProfileInformation extends State<ProfileInformation> {
  bool loader = false;
  late TextEditingController _nameController;
  late TextEditingController _companyController;
  late TextEditingController _businessIndustryController;
  late TextEditingController _emailController;
  late TextEditingController _phoneNumberController;

  Future<void> deleteUserProfile() async {
    Preference preference = await Preference.getInstance();
    final uuid = preference.getUserUUID();
    if (uuid.isEmpty) return;
    setState(() { loader = true; });
    try {
      final client = SupabaseService.instance.supabaseClient;
      await client.from('users').delete().eq('id', uuid);
      await client.auth.signOut();
      if (!context.mounted) return;
      preference.clearAppPreferences();
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => HomePage(Const.homeUI)),
        (route) => false,
      );
    } catch (e) {
      Utils.showToast(e.toString());
    }
    setState(() { loader = false; });
  }

  Future<void> _showDeleteDialog(BuildContext context) async {
    return showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          title: Text(
            Intl.message("delete_account", name: "delete_account"),
            style: GoogleFonts.roboto(
                color: Colors.black,
                fontStyle: FontStyle.normal,
                fontSize: 16,
                fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          content: Text(
              Intl.message("msg_delete_account", name: "msg_delete_account"),
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
                    deleteUserProfile();
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

  void onBackCallBack() {
    setState(() {
      Navigator.pop(context);
    });
  }

  void handleCallback(int val) {
    setState(() {
      if (widget.isUser) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => HomePage(val)),
          (route) => false,
        );
      } else {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => AgentHomePage(val)),
          (route) => false,
        );
      }
    });
  }

  bool _isValidEmail(String email) {
    // Regular expression to validate email format
    final emailRegExp = RegExp(r'^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$');
    return emailRegExp.hasMatch(email);
  }

  bool checkValidations() {
    if (_nameController.value.text.isEmpty) {
      Utils.showToast(Intl.message("msg_valid_name", name: "msg_valid_name"));
      return false;
    } else if (!_isValidEmail(_emailController.value.text)) {
      Utils.showToast(Intl.message("msg_valid_email", name: "msg_valid_email"));
      return false;
    }
    return true;
  }

  Future<void> updateProfile() async {
    setState(() { loader = true; });
    Preference preference = await Preference.getInstance();
    final uuid = preference.getUserUUID();
    try {
      await SupabaseService.instance.updateUserProfile(uuid, {
        'name': _nameController.text.toString(),
        'email': _emailController.text.toString(),
        'phone': _phoneNumberController.text.toString(),
        'business_sector': _businessIndustryController.text.toString(),
        'company': _companyController.text.toString(),
      });
      Utils.showToast(
          Intl.message("msg_profile_updated", name: "msg_profile_updated"));
    } catch (e) {
      Utils.showToast(e.toString());
    }
    setState(() { loader = false; });
  }

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.name);
    _companyController = TextEditingController(text: widget.company);
    _businessIndustryController =
        TextEditingController(text: widget.businessIndustry);
    _emailController = TextEditingController(text: widget.email);
    _phoneNumberController = TextEditingController(text: widget.phoneNumber);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: null,
      body: Stack(
        children: [
          Container(
            color: ThemeColor.bgColor,
          ),
          Container(
            child: Column(
              children: [
                if (widget.isMine)
                  CustomToolbar(
                      Intl.message("information", name: "information"),
                      onBackCallBack,
                      Utils.notificationCount,
                      false),
                if (!widget.isMine)
                  CustomToolbar(
                      Intl.message("contact_information",
                          name: "contact_information"),
                      onBackCallBack,
                      Utils.notificationCount,
                      false),
                Expanded(
                  flex: 4,
                  child: SingleChildScrollView(
                    child: Container(
                      margin: EdgeInsets.only(left: 16, right: 16),
                      child: Column(
                        children: [
                          SizedBox(
                            height: 16,
                          ),
                          Card(
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10.0),
                            ),
                            shadowColor: Color.fromRGBO(
                                158, 158, 158, 0.2549019607843137),
                            child: Container(
                              decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    SizedBox(height: 10),
                                    Container(
                                      width: MediaQuery.of(context).size.width,
                                      child: Center(
                                        child: CircularImageView(
                                          imageUrl: widget.avatar,
                                          radius: 45,
                                        ),
                                      ),
                                    ),
                                    SizedBox(height: 15),
                                    Text(
                                      Intl.message("name", name: "name"),
                                      style: GoogleFonts.roboto(
                                          color: Color.fromRGBO(100, 116, 139, 1),
                                          fontStyle: FontStyle.normal,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400),
                                    ),
                                    SizedBox(height: 10),
                                    SizedBox(
                                      height: 52,
                                      child: TextFormField(
                                        enabled: widget.isMine,
                                        controller: _nameController,
                                        keyboardType: TextInputType.emailAddress,
                                        decoration: InputDecoration(
                                          labelText: widget.name,
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
                                    Text(
                                      Intl.message("company", name: "company"),
                                      style: GoogleFonts.roboto(
                                          color: Color.fromRGBO(100, 116, 139, 1),
                                          fontStyle: FontStyle.normal,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400),
                                    ),
                                    SizedBox(height: 10),
                                    SizedBox(
                                      height: 52,
                                      child: TextFormField(
                                        controller: _companyController,
                                        enabled: widget.isMine,
                                        keyboardType: TextInputType.emailAddress,
                                        decoration: InputDecoration(
                                          labelText: widget.company ?? " ",
                                          border: OutlineInputBorder(
                                            borderSide: BorderSide.none,
                                            borderRadius:
                                                BorderRadius.circular(25.0),
                                          ),
                                          fillColor:
                                              Color.fromRGBO(249, 249, 255, 1),
                                          filled: true,
                                          contentPadding: EdgeInsets.all(20),
                                          floatingLabelBehavior:
                                              FloatingLabelBehavior.never,
                                        ),
                                      ),
                                    ),
                                    SizedBox(height: 16),
                                    Text(
                                      Intl.message("business_industry",
                                          name: "business_industry"),
                                      style: GoogleFonts.roboto(
                                          color: Color.fromRGBO(100, 116, 139, 1),
                                          fontStyle: FontStyle.normal,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400),
                                    ),
                                    SizedBox(height: 10),
                                    SizedBox(
                                      height: 52,
                                      child: TextFormField(
                                        controller: _businessIndustryController,
                                        enabled: widget.isMine,
                                        keyboardType: TextInputType.text,
                                        decoration: InputDecoration(
                                          labelText:
                                              widget.businessIndustry ?? " ",
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
                                    Text(
                                      Intl.message("email", name: "email"),
                                      style: GoogleFonts.roboto(
                                          color: Color.fromRGBO(100, 116, 139, 1),
                                          fontStyle: FontStyle.normal,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400),
                                    ),
                                    SizedBox(height: 10),
                                    SizedBox(
                                      height: 52,
                                      child: TextFormField(
                                        controller: _emailController,
                                        enabled: widget.isMine,
                                        keyboardType: TextInputType.emailAddress,
                                        decoration: InputDecoration(
                                          labelText: widget.email ?? " ",
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
                                    Text(
                                      Intl.message("phone_number",
                                          name: "phone_number"),
                                      style: GoogleFonts.roboto(
                                          color: Color.fromRGBO(100, 116, 139, 1),
                                          fontStyle: FontStyle.normal,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400),
                                    ),
                                    SizedBox(height: 10),
                                    SizedBox(
                                      height: 52,
                                      child: TextFormField(
                                        controller: _phoneNumberController,
                                        enabled: widget.isMine,
                                        keyboardType: TextInputType.emailAddress,
                                        decoration: InputDecoration(
                                          labelText: widget.phoneNumber ?? " ",
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
                                    if (widget.isMine)
                                      Center(
                                          child: TextButton(
                                              style: TextButton.styleFrom(
                                                fixedSize: Size(290, 50),
                                                backgroundColor: Color.fromRGBO(
                                                    69, 152, 209, 1),
                                                // Set the background color to black
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(
                                                      25.0), // Set the border radius
                                                ),
                                              ),
                                              onPressed: () async {
                                                if (checkValidations()) {
                                                  updateProfile();
                                                }
                                              },
                                              child: Text(
                                                  Intl.message("update",
                                                      name: "update"),
                                                  style: GoogleFonts.roboto(
                                                      color: Colors.white,
                                                      fontSize: 20,
                                                      fontWeight:
                                                          FontWeight.w500)))),
                                    if (widget.isMine)
                                      SizedBox(
                                        height: 30,
                                      ),
                                    if (widget.isMine)
                                      Center(
                                          child: TextButton(
                                              style: TextButton.styleFrom(
                                                fixedSize: Size(290,
                                                    50), // Set the background color to black
                                              ),
                                              onPressed: () async {
                                                _showDeleteDialog(context);
                                              },
                                              child: Text(
                                                  Intl.message("delete_account",
                                                      name: "delete_account"),
                                                  style: GoogleFonts.roboto(
                                                      color: Colors.red,
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.w500)))),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 16,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                if (widget.isUser) CustomBottomBar(-1, handleCallback),
                if (!widget.isUser) CustomBottomBarAgent(-1, handleCallback)
              ],
            ),
          ),
        ],
      ),
    );
  }
}
