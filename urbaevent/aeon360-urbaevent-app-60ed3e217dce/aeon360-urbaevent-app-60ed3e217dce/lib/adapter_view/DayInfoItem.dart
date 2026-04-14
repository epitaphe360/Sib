import 'package:flutter/material.dart';
import 'package:com.urbaevent/model/events/ResponseSchedule.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/widgets/CircularImage.dart';
import 'package:com.urbaevent/widgets/VerticalDashLine.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class DayInfoItem extends StatefulWidget {
  final position;
  final DayInfo datum;

  DayInfoItem(this.position, this.datum);

  @override
  State<DayInfoItem> createState() => _DayInfoItem();
}

class _DayInfoItem extends State<DayInfoItem> {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      alignment: Alignment.topLeft,
      width: MediaQuery.of(context).size.width,
      child: Row(
        children: [
          SizedBox(
            width: 16,
          ),
          Column(
            children: [
              Container(
                width: 53,
                height: 53,
                padding: EdgeInsets.all(10.0),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color.fromRGBO(69, 152, 209, 1),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      Intl.message("day", name: "day"),
                      style: GoogleFonts.roboto(
                          color: Colors.white,
                          fontStyle: FontStyle.normal,
                          fontSize: 12,
                          fontWeight: FontWeight.w400),
                    ),
                    Text(
                      '${widget.position??" "}',
                      style: GoogleFonts.roboto(
                          color: Colors.white,
                          fontStyle: FontStyle.normal,
                          fontSize: 16,
                          fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
              Container(height: 65, child: VerticalDashedLine())
            ],
          ),
          SizedBox(
            width: 25,
          ),
          Container(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 25, top: 10),
                  child: Text(
                    DateFormat('EEE, dd MMMM, yyyy').format(widget.datum.date!),
                    style: GoogleFonts.roboto(
                        color: Color.fromRGBO(51, 51, 51, 1),
                        fontStyle: FontStyle.normal,
                        fontSize: 14,
                        fontWeight: FontWeight.w400),
                  ),
                ),
                Container(
                  height: 72,
                  margin: new EdgeInsets.only(top: 16.0, left: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                  child: Row(
                    children: [
                      SvgPicture.asset(
                        'assets/day_item_prefix.svg',
                        colorFilter: ColorFilter.mode(
                            Color.fromRGBO(235, 154, 68, 1),
                            BlendMode.srcATop),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      CircularImage(imageUrl: Urls.imageURL+widget.datum.banner!.url!, radius: 20),
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
                            '${widget.datum.startTime!.substring(0,5)} / ${widget.datum.endTime!.substring(0,5)}',
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
