import 'package:flutter/material.dart';
import 'package:com.urbaevent/model/AssociateInfo.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';

class Associate extends StatefulWidget {
  final Function(int,int,double,double) callback;
  final int index;
  final AssociateInfo associateInfo;

  Associate(this.index, this.associateInfo, this.callback);

  @override
  State<Associate> createState() => _Associate();
}

class _Associate extends State<Associate> {
  @override
  Widget build(BuildContext context) {
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
        height: 90,
        child: Row(children: [
          SizedBox(width: 10),
          Expanded(
            flex: 1,
            child: Container(
              margin: EdgeInsets.all(15),
              alignment: Alignment.topLeft,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        widget.associateInfo.name??" ",
                        style: GoogleFonts.roboto(
                            color: ThemeColor.textPrimary,
                            fontStyle: FontStyle.normal,
                            fontSize: 16,
                            fontWeight: FontWeight.w700),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Text(
                        widget.associateInfo.jobPosition??" ",
                        style: GoogleFonts.roboto(
                            color: ThemeColor.textGrey,
                            fontStyle: FontStyle.normal,
                            fontSize: 12,
                            fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Text(
                    widget.associateInfo.phone??" ",
                    style: GoogleFonts.roboto(
                        color: Color.fromRGBO(69, 152, 209, 1),
                        fontStyle: FontStyle.normal,
                        fontSize: 14,
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
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTapUp: (TapUpDetails details) {
                      double dx = details.globalPosition.dx;
                      double dy = details.globalPosition.dy;
                      widget.callback(0,widget.index,dx,dy);
                    },
                    child: Container(
                      alignment: Alignment.center,
                        width: 20,
                        child: SvgPicture.asset('assets/ic_more.svg'))),
                GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTapUp: (TapUpDetails details) {
                      double dx = details.globalPosition.dx;
                      double dy = details.globalPosition.dy;
                      widget.callback(1,widget.index,dx,dy);
                    },
                    child: Container(
                        alignment: Alignment.center,
                        width: 20,
                        child: SvgPicture.asset('assets/ic_email_invite.svg'))),
                GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTapUp: (TapUpDetails details) {
                      double dx = details.globalPosition.dx;
                      double dy = details.globalPosition.dy;
                      widget.callback(2,widget.index,dx,dy);
                    },
                    child: Container(
                        alignment: Alignment.center,
                        width: 20,
                        child: SvgPicture.asset('assets/ic_download_invite.svg')))
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
