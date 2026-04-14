import 'package:com.urbaevent/utils/Urls.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../model/ResponseContactList.dart';
import '../widgets/CircularImageUserView.dart';

class MyContact extends StatefulWidget {
  final Function(int) callback;
  final ContactItem datum;
  final position;

  MyContact(this.position, this.datum, this.callback);

  @override
  State<MyContact> createState() => _MyContact();
}

class _MyContact extends State<MyContact> {
  @override
  Widget build(BuildContext context) {
    String strURL = "";
    if (widget.datum.users != null && widget.datum.users![0].avatar != null) {
      strURL = Urls.imageURL + (widget.datum.users![0].avatar!.url ?? "");
    } else {
      strURL = Urls.imageURL;
    }
    return Card(
      margin: new EdgeInsets.only(top: 16.0, left: 16, right: 16),
      elevation: 3.0,
      shadowColor: Color.fromRGBO(158, 158, 158, 0.2549019607843137),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      color: Colors.white,
      child: Container(
        decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
        constraints: BoxConstraints(
          minHeight: 80.0, // Minimum height
        ),
        child: Row(children: [
          SizedBox(width: 10),
          CircularImageView(
            imageUrl: strURL,
          ),
          Expanded(
            flex: 1,
            child: Container(
              margin: EdgeInsets.all(15),
              alignment: Alignment.topLeft,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                   widget.datum.users![0].name??" ",
                    style: GoogleFonts.roboto(
                        color: Colors.black,
                        fontStyle: FontStyle.normal,
                        fontSize: 16,
                        height: 1.1,
                        fontWeight: FontWeight.w700),
                  ),
                  SizedBox(
                    height: 5,
                  ),
                  Text(
                      widget.datum.event!.name??" ",
                    style: GoogleFonts.roboto(
                        color: Color.fromRGBO(69, 152, 209, 1),
                        fontStyle: FontStyle.normal,
                        fontSize: 14,
                        height: 1.1,
                        fontWeight: FontWeight.w500),
                  ),
                  SizedBox(
                    height: 5,
                  ),
                ],
              ),
            ),
          ),
          Container(
            child: Stack(
              alignment: Alignment.center,
              children: [
                TextButton(
                  onPressed: () {
                    widget.callback(widget.position);
                  },
                  child: Container(
                    width: 56,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Color.fromRGBO(69, 152, 209, 1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
                TextButton(
                    onPressed: () {
                      widget.callback(widget.position);
                    },
                    child: Text(
                      Intl.message("view", name: "view"),
                      style: GoogleFonts.roboto(
                          color: Colors.white,
                          fontStyle: FontStyle.normal,
                          fontSize: 11,
                          fontWeight: FontWeight.w500),
                    )),
              ],
            ),
          ),
          SizedBox(
            width: 10,
          ),
        ]),
      ),
    );
  }
}
