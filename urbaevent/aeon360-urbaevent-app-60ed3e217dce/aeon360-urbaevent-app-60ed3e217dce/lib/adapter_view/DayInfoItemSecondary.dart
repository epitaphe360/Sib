import 'package:flutter/material.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/widgets/VerticalDashLine.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:com.urbaevent/model/events/ResponseSchedule.dart';
import 'package:google_fonts/google_fonts.dart';

import '../widgets/CircularImage.dart';

class DayInfoItemSecondary extends StatefulWidget {
  final position;
  final DayInfo datum;

  DayInfoItemSecondary(this.position, this.datum);

  @override
  State<DayInfoItemSecondary> createState() => _DayInfoItemSecondary();
}

class _DayInfoItemSecondary extends State<DayInfoItemSecondary> {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 90,
      alignment: Alignment.topLeft,
      width: MediaQuery.of(context).size.width,
      child: Row(
        children: [
          SizedBox(
            width: 16,
          ),
          Column(
            children: [
              Container(height: 90, width: 53, child: VerticalDashedLine())
            ],
          ),
          SizedBox(
            width: 25,
          ),
          Container(
            height: 72,
            margin: new EdgeInsets.only(left: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10.0),
            ),
            child: Row(
              children: [
                SvgPicture.asset(
                  'assets/day_item_prefix.svg',
                  colorFilter: ColorFilter.mode(
                      Color.fromRGBO(235, 154, 68, 1), BlendMode.srcATop),
                ),
                SizedBox(
                  width: 10,
                ),
                CircularImage(
                    imageUrl: Urls.imageURL + widget.datum.banner!.url!,
                    radius: 20),
                SizedBox(
                  width: 10,
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width:170,
                      child: Text(
                        widget.datum.name??" ",
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.roboto(
                            color: Color.fromRGBO(51, 51, 51, 1),
                            fontStyle: FontStyle.normal,
                            fontSize: 15,
                            fontWeight: FontWeight.w400),
                      ),
                    ),
                    SizedBox(
                      height: 5,
                    ),
                    Text(
                      '${widget.datum.startTime!.substring(0, 5)} / ${widget.datum.endTime!.substring(0, 5)}',
                      style: GoogleFonts.roboto(
                          color: Color.fromRGBO(69, 152, 209, 1),
                          fontStyle: FontStyle.normal,
                          fontSize: 12,
                          fontWeight: FontWeight.w400),
                    ),
                  ],
                )
              ],
            ),
          ),
          SizedBox(
            width: 16,
          ),
        ],
      ),
    );
  }
}
