import 'package:flutter/material.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class EvenDayNumber extends StatefulWidget {
  final Function(int) callback;
  final position;
  final dayIndex;

  EvenDayNumber(this.position, this.dayIndex, this.callback);

  @override
  State<EvenDayNumber> createState() => _EvenDayNumber();
}

class _EvenDayNumber extends State<EvenDayNumber> {
  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color txtColor1;
    Color txtColor2;
    if (widget.position == widget.dayIndex) {
      txtColor1=Colors.white;
      txtColor2=Colors.white;
      bgColor = ThemeColor.colorAccent;
    } else {
      txtColor1=Color.fromRGBO(100, 116, 139, 1);
      txtColor2=ThemeColor.textPrimary;
      bgColor = Colors.white;
    }

    return GestureDetector(
      onTap: () {
        if(widget.dayIndex==widget.position){
          widget.callback(-1);
        }else{
          widget.callback(widget.position);
        }
      },
      child: Center(
          child: Container(
        height: 64,
        width: 64,
        margin: new EdgeInsets.only(left: 16.0),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12.0),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              Intl.message("day", name: "day"),
              style: GoogleFonts.roboto(
                  color: txtColor1,
                  fontStyle: FontStyle.normal,
                  fontSize: 10,
                  fontWeight: FontWeight.w400),
            ),
            SizedBox(
              height: 5,
            ),
            Text(
              '${widget.position + 1}',
              style: GoogleFonts.roboto(
                  color: txtColor2,
                  fontStyle: FontStyle.normal,
                  fontSize: 18,
                  fontWeight: FontWeight.w500),
            ),
          ],
        ),
      )),
    );
  }
}
