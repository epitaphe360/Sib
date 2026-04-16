import 'package:cached_network_image/cached_network_image.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../model/events/ResponseEbadges.dart';

class Ebadge extends StatefulWidget {
  final Function(int) callback;
  final Datum datum;
  final position;

  Ebadge(this.position, this.datum, this.callback);

  @override
  State<Ebadge> createState() => _Ebadge();
}

class _Ebadge extends State<Ebadge> {
  String type = "";
  String formattedTime="";


  @override
  void initState() {
    super.initState();
    getType();
    DateTime newStartDate = widget.datum.event.startDate.add(Duration(hours: 1));
     formattedTime = DateFormat('hh:mm a').format(newStartDate);
  }

  Future<void> getType() async {
    Preference preference = await Preference.getInstance();
    setState(() {
      if (preference.getLanguage() == "fr") {
        if (widget.datum.type.toLowerCase() == "visitor") {
          type = "Visiteur";
        } else if (widget.datum.type.toLowerCase() == "exhibitor") {
          type = "Exposant";
        } else {
          type = widget.datum.type;
        }
      } else {
        type = widget.datum.type;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Padding(
        padding: EdgeInsets.only(left: 16, right: 16, top: 16),
        child: Container(
          padding: EdgeInsets.all(10),
          decoration: BoxDecoration(
            image: DecorationImage(
              image:
                  AssetImage('assets/subtract.png'), // Your custom image path
              fit: BoxFit.fill, // Adjust the fit as needed
            ),
          ),
          child: Column(
            children: [
              Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(width: 20),
                    Column(
                      children: [
                        SizedBox(height: 16),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          // Set the border radius here
                          child: CachedNetworkImage(
                            fit: BoxFit.cover,
                            height: 60,
                            width: 60,
                            imageUrl:
                                Urls.imageURL + widget.datum.event.logo!.url,
                            // Replace with your image URL
                            placeholder: (context, url) => Container(
                                alignment: Alignment.center,
                                height: 50,
                                child: Center(
                                    child: CircularProgressIndicator(
                                  color: Colors.black.withValues(alpha: 0.2),
                                ))),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(width: 8),
                    Container(
                      margin: EdgeInsets.all(16),
                      alignment: Alignment.topLeft,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 200,
                            child: Text(
                              widget.datum.event.name,
                              maxLines: 1,
                              style: GoogleFonts.roboto(
                                  color: Color.fromRGBO(69, 152, 209, 1),
                                  fontStyle: FontStyle.normal,
                                  fontSize: 18,
                                  height: 1,
                                  fontWeight: FontWeight.w700),
                            ),
                          ),
                          SizedBox(
                            height: 5,
                          ),
                          Row(
                            children: [
                              Image.asset(
                                'assets/ic_event.png',
                                width: 14,
                                height: 14,
                              ),
                              SizedBox(width: 10),
                              Text(
                                '${DateFormat('dd MMM yyyy').format(widget.datum.event.startDate)} - ${DateFormat('dd MMM yyyy').format(widget.datum.event.endDate)}',
                                style: GoogleFonts.roboto(
                                    color: Color.fromRGBO(100, 116, 139, 1),
                                    fontStyle: FontStyle.normal,
                                    fontSize: 14,
                                    height: 1,
                                    fontWeight: FontWeight.w400),
                              ),
                            ],
                          ),
                          SizedBox(
                            height: 5,
                          ),
                          Row(
                            children: [
                              Image.asset(
                                'assets/map_pin.png',
                                width: 14,
                                height: 14,
                              ),
                              SizedBox(width: 10),
                              Container(
                                width: 200,
                                child: Text(
                                  widget.datum.event.locationAddress,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.roboto(
                                      color: Color.fromRGBO(100, 116, 139, 1),
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
              SizedBox(height: 6,),
              Image.asset(
                'assets/line.png',
                width: MediaQuery.of(context).size.width - 100,
                fit: BoxFit.cover,
              ),
              SizedBox(height: 6,),
              Row(
                children: [
                  Spacer(),
                  Container(
                    margin: EdgeInsets.all(16),
                    alignment: Alignment.topLeft,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(Intl.message("ebadge_type", name: "ebadge_type"),
                            style: GoogleFonts.roboto(
                                color: Color.fromRGBO(100, 116, 139, 1),
                                fontStyle: FontStyle.normal,
                                fontSize: 12,
                                height: 1,
                                fontWeight: FontWeight.w400)),
                        SizedBox(
                          height: 3,
                        ),
                        Text(type,
                            style: GoogleFonts.roboto(
                                color: Color.fromRGBO(69, 152, 209, 1),
                                fontStyle: FontStyle.normal,
                                fontSize: 12,
                                height: 1,
                                fontWeight: FontWeight.w400))
                      ],
                    ),
                  ),
                  Spacer(),
                  Container(
                    margin: EdgeInsets.all(16),
                    alignment: Alignment.topLeft,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(Intl.message("entry_hour", name: "entry_hour"),
                            style: GoogleFonts.roboto(
                                color: Color.fromRGBO(100, 116, 139, 1),
                                fontStyle: FontStyle.normal,
                                fontSize: 12,
                                height: 1,
                                fontWeight: FontWeight.w400)),
                        SizedBox(
                          height: 3,
                        ),
                        Text(
                            formattedTime,
                            style: GoogleFonts.roboto(
                                color: Color.fromRGBO(69, 152, 209, 1),
                                fontStyle: FontStyle.normal,
                                fontSize: 12,
                                height: 1,
                                fontWeight: FontWeight.w400))
                      ],
                    ),
                  ),
                  Spacer(),
                  Spacer(),
                  Spacer(),
                  Spacer(),
                  Spacer(),
                  Spacer(),
                  Spacer(),
                  if (widget.datum.confirmed == false)
                    Container(
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          TextButton(
                            onPressed: () {
                              widget.callback(widget.position);
                            },
                            child: Container(
                              width: 70,
                              height: 32,
                              decoration: BoxDecoration(
                                color: ThemeColor.textGrey,
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                          ),
                          TextButton(
                              onPressed: () {
                                widget.callback(widget.position);
                              },
                              child: Text(
                                Intl.message("rejected", name: "rejected"),
                                style: GoogleFonts.roboto(
                                    color: Colors.white,
                                    fontStyle: FontStyle.normal,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500),
                              )),
                        ],
                      ),
                    ),
                  if (widget.datum.confirmed == null)
                    Container(
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          TextButton(
                            onPressed: () {
                              widget.callback(widget.position);
                            },
                            child: Container(
                              width: 70,
                              height: 32,
                              decoration: BoxDecoration(
                                color: ThemeColor.textGrey,
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                          ),
                          TextButton(
                              onPressed: () {
                                widget.callback(widget.position);
                              },
                              child: Text(
                                Intl.message("pending", name: "pending"),
                                style: GoogleFonts.roboto(
                                    color: Colors.white,
                                    fontStyle: FontStyle.normal,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500),
                              )),
                        ],
                      ),
                    ),
                  if (widget.datum.confirmed == true)
                    Container(
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          TextButton(
                            onPressed: () {
                              widget.callback(widget.position);
                            },
                            child: Container(
                              width: 70,
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
                  Spacer(),
                  Spacer(),
                  Spacer(),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
