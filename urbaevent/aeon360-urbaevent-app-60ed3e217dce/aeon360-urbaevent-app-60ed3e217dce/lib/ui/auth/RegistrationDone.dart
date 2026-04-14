import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class RegistrationDone extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _RegistrationDone();
}

class _RegistrationDone extends State<RegistrationDone> {


  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      systemNavigationBarColor: Color.fromRGBO(249, 249, 255, 1),
      // navigation bar color
      statusBarColor: Color.fromRGBO(249, 249, 255, 1), // status bar color
    ));
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'UrbaEvent',
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
                SizedBox(height: 120.0),
                SvgPicture.asset('assets/ic_reg_done.svg',height: 200,),
                Center(
                    child: Card(
                        elevation: 0,
                        margin: EdgeInsets.fromLTRB(20, 20, 20, 0),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20.0),
                        ),
                        child: Padding(
                            padding: EdgeInsets.fromLTRB(20.0, 40, 20, 40),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Text(
                            Intl.message("account_created",
                                name: "account_created"),
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.roboto(
                                      fontSize: 18,
                                      decoration: TextDecoration.none,
                                      fontWeight: FontWeight.w700,
                                      color: Color.fromRGBO(235, 154, 68, 1)),
                                ),
                                SizedBox(height: 18),
                                Text(
                                  Intl.message("your_account_created",
                                      name: "your_account_created"),
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.roboto(
                                      fontSize: 18,
                                      decoration: TextDecoration.none,
                                      fontWeight: FontWeight.w400,
                                      color: Colors.black),
                                ),
                                SizedBox(height: 30.0),
                                Center(
                                    child: TextButton(
                                        onPressed: () async {
                                          Navigator.pushAndRemoveUntil(
                                            context,
                                            MaterialPageRoute(builder: (context) => HomePage(Const.homeUI)),(route) => false,
                                          );
                                        },
                                        child: Image.asset(
                                          'assets/ic_go_home.png',
                                          // Replace with the actual image URL
                                        ))),
                              ],
                            )))),
              ],
            ),
          )
        ]),
      ),
    );
  }
}
