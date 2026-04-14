import 'dart:io';

import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';


class Progressbar extends StatelessWidget {
  bool loader;

  Progressbar(this.loader);

  @override
  Widget build(BuildContext context) {
    if(Platform.isAndroid){
      return Visibility(
        visible: loader,
        child: Container(
          color: Colors.black.withOpacity(0.01),
          child: Center(
             child: Container(

            alignment: Alignment.center,
            height: 120,
            width: 150,
            child: Card(
              margin: new EdgeInsets.only(top: 16.0, left: 16, right: 16),
              elevation: 3.0,
              shadowColor: Color.fromRGBO(158, 158, 158, 0.2549019607843137),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10.0),
              ),
              color: Colors.white,
              child: Container(
                height: 130,
                width: 180,
                decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      color:ThemeColor.colorAccent
                    ),
                    SizedBox(height: 10,),
                    Text(Intl.message("loading", name: "loading"),
                        style: GoogleFonts.roboto(
                            color:ThemeColor.colorAccent,
                            fontStyle: FontStyle.normal,
                            fontSize: 16,
                            fontWeight: FontWeight.w600))
                  ],
                ),
              ),
            ),
          ),
          ),
        ),
      );
    }else{
      return Visibility(
        visible: loader,
        child: Container(
          color: Colors.black.withOpacity(0.01),
          child: Center(
            child: CupertinoActivityIndicator(radius: 25,)
          ),
        ),
      );
    }

  }
}
