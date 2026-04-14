import 'package:cached_network_image/cached_network_image.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../model/events/ResponsePortal.dart';

class Portal extends StatefulWidget {
  final PortalItem datum;

  Portal(this.datum);

  @override
  State<Portal> createState() => _Portal();
}

class _Portal extends State<Portal> {
  @override
  Widget build(BuildContext context) {
    String strURL = "";
    if (widget.datum.user != null &&
        widget.datum.user!.avatar != null &&
        widget.datum.user!.avatar!.url != null) {
      strURL = Urls.imageURL + (widget.datum.user!.avatar!.url ?? "");
    }
    String gateName = " ";
    if (widget.datum.gate != null) {
      gateName = widget.datum.gate!.name ?? " ";
    } else {
      gateName = " ";
    }
    String boothName = " ";
    if (widget.datum.booth != null) {
      boothName = widget.datum.booth ?? " ";
    } else {
      boothName = " ";
    }

    String company = " ";
    if (widget.datum.user != null && widget.datum.user!.company != null) {
      company.replaceAll("\n", "");
      company = widget.datum.user!.company!;
      if (company.length < 10) {
        company = company + " \n";
      }
    }

    String businessSector = " ";
    if (widget.datum.user != null &&
        widget.datum.user!.businessSector != null) {
      businessSector = widget.datum.user!.businessSector!.toString();
    }

    return Container(
      child: Card(
        elevation: 3.0,
        shadowColor: Color.fromRGBO(0, 0, 0, 0.2549019607843137),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.0),
        ),
        color: Colors.white,
        child: Container(
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(10))),
          width: (MediaQuery
              .of(context)
              .size
              .width / 2) - 26,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(alignment: Alignment.center, children: [
                if (strURL.isNotEmpty)
                  Container(
                    margin: EdgeInsets.all(10),
                    height: 120,
                    width: 160,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: CachedNetworkImage(
                        height: 120,
                        width: 160,
                        fit: BoxFit.cover,
                        imageUrl: strURL,
                      ),
                    ),
                  ),

                if (strURL.isEmpty)
                  Container(
                    margin: EdgeInsets.all(10),
                    height: 120,
                    width: 160,

                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                          color: Color.fromRGBO(
                              158, 158, 158, 0.3607843137254902),
                      ),
                    ),
                  )
              ]),
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Container(
                  alignment: Alignment.center,
                  width: 150,
                  child: Text(
                    company,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.roboto(
                        color: Color.fromRGBO(69, 152, 209, 1),
                        fontStyle: FontStyle.normal,
                        fontSize: 16,
                        fontWeight: FontWeight.w700),
                  ),
                ),
              ),
              Container(
                alignment: Alignment.center,
                child: Text(
                  businessSector,
                  style: GoogleFonts.roboto(
                      color: Color.fromRGBO(100, 116, 139, 1),
                      fontStyle: FontStyle.normal,
                      fontSize: 12,
                      fontWeight: FontWeight.w400),
                ),
              ),
              SizedBox(
                height: 8,
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Spacer(flex: 4,),
                  SvgPicture.asset(
                    'assets/ic_loc.svg',
                    width: 10,
                    height: 10,
                  ),
                  SizedBox(
                    width: 5,
                  ),
                  Text(
                    Intl.message("hall", name: "hall"),
                    style: GoogleFonts.roboto(
                        color: Color.fromRGBO(100, 116, 139, 1),
                        fontStyle: FontStyle.normal,
                        fontSize: 10,
                        fontWeight: FontWeight.w400),
                  ),
                  SizedBox(
                    width: 2,
                  ),
                  Container(
                    width: 30,
                    child: Text(
                      gateName,
                      maxLines: 1,
                      style: GoogleFonts.roboto(
                          color: Color.fromRGBO(69, 152, 209, 1),
                          fontStyle: FontStyle.normal,
                          fontSize: 10,
                          fontWeight: FontWeight.w400),
                    ),
                  ),
                  SizedBox(
                    width: 10,
                  ),
                  SvgPicture.asset(
                    'assets/ic_loc.svg',
                    width: 10,
                    height: 10,
                  ),
                  SizedBox(
                    width: 5,
                  ),
                  Text(
                    Intl.message("booth", name: "booth"),
                    style: GoogleFonts.roboto(
                        color: Color.fromRGBO(100, 116, 139, 1),
                        fontStyle: FontStyle.normal,
                        fontSize: 10,
                        fontWeight: FontWeight.w400),
                  ),
                  SizedBox(
                    width: 2,
                  ),
                  Container(
                    width: 25,
                    child: Text(
                      boothName,
                      maxLines: 1,
                      style: GoogleFonts.roboto(
                          color: Color.fromRGBO(69, 152, 209, 1),
                          fontStyle: FontStyle.normal,
                          fontSize: 10,
                          fontWeight: FontWeight.w400),
                    ),
                  ),
                  Spacer(flex: 1,),
                ],
              ),
              SizedBox(
                height: 5,
              )
            ],
          ),
        ),
      ),
    );
  }
}
