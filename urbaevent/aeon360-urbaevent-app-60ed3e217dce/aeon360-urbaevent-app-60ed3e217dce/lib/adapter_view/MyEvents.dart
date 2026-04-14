import 'package:cached_network_image/cached_network_image.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/model/events/ResponseMyEvents.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:google_fonts/google_fonts.dart';

class MyEvents extends StatefulWidget {
  final Function(int, int, String) callback;
  final position;
  final Datum datum;

  MyEvents(this.datum, this.position, this.callback);

  @override
  State<MyEvents> createState() => _MyEvents();
}

class _MyEvents extends State<MyEvents> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (widget.datum.confirmed == null) {
          widget.callback(widget.datum.event.id, Const.eventConfirmationPending,
              widget.datum.type ?? "");
        } else {
          if (widget.datum.confirmed!) {
            widget.callback(widget.datum.event.id, Const.eventConfirmed,
                widget.datum.type ?? "");
          } else {
            widget.callback(widget.datum.event.id,
                Const.eventConfirmationRejected, widget.datum.type ?? "");
          }
        }
      },
      child: Card(
        margin: new EdgeInsets.only(top: 16.0, left: 16, right: 16),
        elevation: 2,
        shadowColor: Color.fromRGBO(
            0, 0, 0, 0.2549019607843137),
        child: Container(
          decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
          constraints: BoxConstraints(
            minHeight: 105,  // Ensuring the minimum height remains at 105
          ),
          child: Row(children: [
            SizedBox(width: 10),
            ClipRRect(
                borderRadius: BorderRadius.circular(10),
                // Set the border radius here
                child: CachedNetworkImage(
                  fit: BoxFit.cover,
                  height: 80,
                  width: 80,
                  imageUrl: Urls.imageURL + widget.datum.event.banner.url.toString(),
                  // Replace with your image URL
                  placeholder: (context, url) => Container(
                      alignment: Alignment.center,
                      height: 50,
                      child: Center(
                          child: CircularProgressIndicator(
                        color: Colors.black.withOpacity(0.2),
                      ))),
                )),
            Container(
              margin: EdgeInsets.all(10),
              alignment: Alignment.topLeft,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 210,
                    child: Text(
                      widget.datum.event.name,
                      style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontStyle: FontStyle.normal,
                          fontSize: 18,
                          fontWeight: FontWeight.w700),
                    ),
                  ),
                  SizedBox(
                    height: 5,
                  ),
                  Text(
                    'By ${widget.datum.event.organizer}',
                    style: GoogleFonts.roboto(
                        color: Colors.black,
                        fontStyle: FontStyle.normal,
                        fontSize: 14,
                        fontWeight: FontWeight.w400),
                  ),
                  SizedBox(
                    height: 5,
                  ),
                  Row(
                    children: [
                      Image.asset(
                        'assets/icon_location.png',
                        width: 14,
                        height: 14,
                      ),
                      SizedBox(width: 5),
                      Container(
                        width: 210,
                        child: Text(
                          widget.datum.event.locationAddress,
                          maxLines: 2,

                          style: GoogleFonts.roboto(
                              color: Colors.black,
                              fontStyle: FontStyle.normal,
                              fontSize: 14,
                              height: 1,
                              fontWeight: FontWeight.w400),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            )
          ]),
        ),
      ),
    );
  }
}
