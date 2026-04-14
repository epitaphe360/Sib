import 'package:cached_network_image/cached_network_image.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/model/events/ResponseEventConferences.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../utils/Urls.dart';

class Conference extends StatefulWidget {
  final position;
  final Datum datum;
  final Function(int, bool) callback;
  final isRegisteredForEvent;

  Conference(
      this.position, this.datum, this.callback, this.isRegisteredForEvent);

  @override
  State<Conference> createState() => _Conference();
}

class _Conference extends State<Conference> {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: GestureDetector(
        onTap: () {
          widget.callback(widget.position, true);
        },
        child: Card(
          margin: new EdgeInsets.only(top: 16.0, left: 16, right: 16),
          elevation: 2,
          shadowColor: Color.fromRGBO(158, 158, 158, 0.2549019607843137),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          color: Colors.white,
          child: Container(
            decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
            child: Row(children: [
              SizedBox(width: 16),
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                // Set the border radius here
                child: CachedNetworkImage(
                  fit: BoxFit.cover,
                  height: 100,
                  width: 100,
                  imageUrl: Urls.imageURL + widget.datum.banner.url,
                  // Replace with your image URL
                  placeholder: (context, url) => Container(
                      alignment: Alignment.center,
                      height: 50,
                      child: Center(
                          child: CircularProgressIndicator(
                        color: Colors.black.withOpacity(0.2),
                      ))),
                ),
              ),
              Expanded(
                child: Container(
                  margin: EdgeInsets.all(16),
                  alignment: Alignment.topLeft,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        height: 5,
                      ),
                      Text(
                        widget.datum.name.trim(),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.roboto(
                            color: Color.fromRGBO(51, 51, 51, 1),
                            fontStyle: FontStyle.normal,
                            fontSize: 16,
                            fontWeight: FontWeight.w700),
                      ),
                      SizedBox(
                        height: 8,
                      ),
                      Row(
                        children: [
                          Image.asset(
                            'assets/ic_event.png',
                            width: 12,
                            height: 12,
                          ),
                          SizedBox(width: 5),
                          Text(
                            DateFormat('dd MMM yyyy').format(widget.datum.date),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.roboto(
                                color: Color.fromRGBO(100, 116, 139, 1),
                                fontStyle: FontStyle.normal,
                                fontSize: 12,
                                fontWeight: FontWeight.w400),
                          ),
                          SizedBox(width: 12),
                          SvgPicture.asset(
                            'assets/ic_clock.svg',
                            width: 12,
                            height: 12,
                          ),
                          SizedBox(width: 5),
                          Text(
                            widget.datum.startTime.substring(0, 5),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.roboto(
                                color: Color.fromRGBO(100, 116, 139, 1),
                                fontStyle: FontStyle.normal,
                                fontSize: 12,
                                fontWeight: FontWeight.w400),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: 8,
                      ),
                      Row(
                        children: [
                          Image.asset(
                            'assets/map_pin.png',
                            width: 12,
                            height: 12,
                          ),
                          SizedBox(width: 5),
                          Container(
                            width: 200,
                            child: Text(
                              widget.datum.location,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.roboto(
                                  color: Color.fromRGBO(100, 116, 139, 1),
                                  fontStyle: FontStyle.normal,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w400),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: 8,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (!widget.isRegisteredForEvent)
                            InkWell(
                              onTap: () {
                               Utils.showToast(Intl.message("msg_pls_subscribe_for_conference", name: "msg_pls_subscribe_for_conference"));
                              },
                              child: Container(
                                width: 74,
                                height: 32,
                                decoration: BoxDecoration(
                                  color: Color.fromRGBO(196, 196, 196, 1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: TextButton(
                                    onPressed: () {
                                      Utils.showToast(Intl.message("msg_pls_subscribe_for_conference", name: "msg_pls_subscribe_for_conference"));
                                    },
                                    child: Text(
                                      Intl.message("assist", name: "assist"),
                                      style: GoogleFonts.roboto(
                                          color: Colors.white,
                                          fontStyle: FontStyle.normal,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500),
                                    )),
                              ),
                            ),
                          if (widget.isRegisteredForEvent &&
                              widget.datum.isConfirmed == null)
                            InkWell(
                              onTap: () {
                                widget.callback(widget.position, false);
                              },
                              child: Container(
                                width: 74,
                                height: 32,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: Color.fromRGBO(69, 152, 209, 1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  Intl.message("assist", name: "assist"),
                                  style: GoogleFonts.roboto(
                                      color: Colors.white,
                                      fontStyle: FontStyle.normal,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500),
                                ),
                              ),
                            ),
                          if (widget.isRegisteredForEvent &&
                              widget.datum.isConfirmed != null &&
                              widget.datum.isConfirmed!)
                            Container(
                              height: 32,
                              child: Row(
                                children: [
                                  Image.asset('assets/icon_tick.png',
                                      height: 18, width: 18),
                                  SizedBox(
                                    width: 6,
                                  ),
                                 /* Text(
                                    Intl.message("assisting",
                                        name: "assisting"),
                                    style: GoogleFonts.roboto(
                                        color: ThemeColor.textPrimary,
                                        fontStyle: FontStyle.normal,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500),
                                  ),*/
                                ],
                              ),
                            ),
                          SizedBox(
                            width: 10,
                          )
                        ],
                      )
                    ],
                  ),
                ),
              )
            ]),
          ),
        ),
      ),
    );
  }
}
