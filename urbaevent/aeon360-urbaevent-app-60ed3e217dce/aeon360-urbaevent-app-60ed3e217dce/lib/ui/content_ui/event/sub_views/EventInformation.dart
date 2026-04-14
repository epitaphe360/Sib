import 'package:cached_network_image/cached_network_image.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:com.urbaevent/model/events/ResponseEvents.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/widgets/CustomBottomBar.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

class EventInformation extends StatefulWidget {
  final EventItem datum;

  EventInformation(this.datum);

  @override
  State<StatefulWidget> createState() => _EventInformation();
}

class _EventInformation extends State<EventInformation> {
  void onCallBack() {
    setState(() {
      Navigator.pop(context);
    });
  }

  void handleCallback(int val) {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => HomePage(val)),
      (route) => false,
    );
  }

  @override
  void initState() {
    super.initState();
    // Set the initial status bar color to transparent
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
    ));
  }

  void _launchEmail(String emailAddress) async {
    final Uri emailLaunchUri = Uri(
      scheme: 'mailto',
      path: emailAddress,
    );
    try {
      await launch(emailLaunchUri.toString());
    } catch (e) {
      print(e.toString());
    }
  }

  void _launchPhone(String phoneNumber) async {
    final url = 'tel:$phoneNumber';
    try {
      await launch(url);
    } catch (e) {
      print(e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: null,
      body: Stack(
        children: [
          Container(color: Color.fromRGBO(249, 249, 255, 1)),
          Column(
            children: [
              CustomToolbar(
                  Intl.message("event_information", name: "event_information"),
                  onCallBack,
                  Utils.notificationCount,
                  false),
              Expanded(
                  flex: 1,
                  child: SingleChildScrollView(
                    child: Container(
                      margin: EdgeInsets.only(left: 16, right: 16),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            height: 20,
                          ),
                          Container(
                              height: 192,
                              width: double.infinity,
                              margin: new EdgeInsets.only(bottom: 16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20.0),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                // Set the border radius here
                                child: CachedNetworkImage(
                                  fit: BoxFit.cover,
                                  height: 192,
                                  width: MediaQuery.of(context).size.width,
                                  imageUrl:
                                      Urls.imageURL + widget.datum.banner!.url,
                                  // Replace with your image URL
                                  placeholder: (context, url) => Container(
                                      alignment: Alignment.center,
                                      height: 50,
                                      child: Center(
                                          child: CircularProgressIndicator(
                                        color: Colors.black.withOpacity(0.2),
                                      ))),
                                ),
                              )),
                          Text(
                            widget.datum.name,
                            style: GoogleFonts.roboto(
                                color: ThemeColor.textPrimary,
                                fontStyle: FontStyle.normal,
                                fontSize: 24,
                                fontWeight: FontWeight.w500),
                          ),
                          SizedBox(
                            height: 5,
                          ),
                          Html(
                            data: widget.datum.fullDescription,
                          ),
                          SizedBox(
                            height: 30,
                          ),
                          Container(
                            height: 80,
                            child: Card(
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10.0),
                              ),
                              shadowColor: Color.fromRGBO(
                                  158, 158, 158, 0.2549019607843137),
                              child: Container(
                                decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  children: [
                                    SizedBox(
                                      width: 16,
                                    ),
                                    SvgPicture.asset(
                                      'assets/ic_date_ei.svg',
                                    ),
                                    SizedBox(width: 10),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          Intl.message("date", name: "date"),
                                          style: GoogleFonts.roboto(
                                              color: ThemeColor.textPrimary,
                                              fontStyle: FontStyle.normal,
                                              fontSize: 16,
                                              fontWeight: FontWeight.w400),
                                        ),
                                        Text(
                                          '${DateFormat('dd MMM yyyy').format(widget.datum.startDate)} - ${DateFormat('dd MMM yyyy').format(widget.datum.endDate)}',
                                          style: GoogleFonts.roboto(
                                              color: ThemeColor.textSecondary,
                                              fontStyle: FontStyle.normal,
                                              fontSize: 16,
                                              fontWeight: FontWeight.w400),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Container(
                            height: 80,
                            child: Card(
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10.0),
                              ),
                              shadowColor: Color.fromRGBO(
                                  158, 158, 158, 0.2549019607843137),
                              child: Container(
                                decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  children: [
                                    SizedBox(
                                      width: 16,
                                    ),
                                    Container(
                                      height: 41,
                                      width: 41,
                                      child: Stack(
                                          alignment: Alignment.center,
                                          children: [
                                            SvgPicture.asset(
                                              "assets/ic_password_change.svg",
                                            ),
                                            Image.asset(
                                              'assets/icon_location.png',
                                              width: 15,
                                              height: 15,
                                              color:
                                                  Color.fromRGBO(235, 154, 68, 1),
                                            ),
                                          ]),
                                    ),
                                    SizedBox(width: 10),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          Intl.message("exhibitionLocation",
                                              name: "exhibitionLocation"),
                                          style: GoogleFonts.roboto(
                                              color: ThemeColor.textPrimary,
                                              fontStyle: FontStyle.normal,
                                              fontSize: 16,
                                              fontWeight: FontWeight.w400),
                                        ),
                                        Container(
                                          width: 200,
                                          child: Text(
                                            widget.datum.locationAddress,
                                            maxLines: 2,
                                            style: GoogleFonts.roboto(
                                                color: ThemeColor.textSecondary,
                                                fontStyle: FontStyle.normal,
                                                fontSize: 16,
                                                fontWeight: FontWeight.w400),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          if (widget.datum.contact != null &&
                              widget.datum.contact!.isNotEmpty)
                            SizedBox(
                              height: 10,
                            ),
                          if (widget.datum.contact != null &&
                              widget.datum.contact!.isNotEmpty)
                            GestureDetector(
                              onTap: (){
                                _launchEmail(widget.datum.contact!);
                              },
                              child: Container(
                                height: 80,
                                child: Card(
                                  elevation: 2,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10.0),
                                  ),
                                  shadowColor: Color.fromRGBO(
                                      158, 158, 158, 0.2549019607843137),
                                  child: Container(
                                    decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.center,
                                      mainAxisAlignment: MainAxisAlignment.start,
                                      children: [
                                        SizedBox(
                                          width: 16,
                                        ),
                                        Container(
                                          height: 41,
                                          width: 41,
                                          child: Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                  "assets/ic_password_change.svg",
                                                ),
                                                SvgPicture.asset(
                                                  'assets/icon_email_contact.svg',
                                                  width: 15,
                                                  height: 15,
                                                ),
                                              ]),
                                        ),
                                        SizedBox(width: 10),
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              Intl.message("address_email",
                                                  name: "address_email"),
                                              style: GoogleFonts.roboto(
                                                  color: ThemeColor.textPrimary,
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w400),
                                            ),
                                            Container(
                                              width: 200,
                                              child: Text(
                                                widget.datum.contact!,
                                                maxLines: 2,
                                                style: GoogleFonts.roboto(
                                                    color: ThemeColor.textSecondary,
                                                    fontStyle: FontStyle.normal,
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.w400),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          if (widget.datum.phone != null &&
                              widget.datum.phone!.isNotEmpty)
                            SizedBox(
                              height: 10,
                            ),
                          if (widget.datum.phone != null &&
                              widget.datum.phone!.isNotEmpty)
                            GestureDetector(
                              onTap: () {
                                _launchPhone(widget.datum.phone!);
                              },
                              child: Container(
                                height: 80,
                                child: Card(
                                  elevation: 2,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10.0),
                                  ),
                                  shadowColor: Color.fromRGBO(
                                      158, 158, 158, 0.2549019607843137),
                                  child: Container(
                                    decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.center,
                                      mainAxisAlignment: MainAxisAlignment.start,
                                      children: [
                                        SizedBox(
                                          width: 16,
                                        ),
                                        Container(
                                          height: 41,
                                          width: 41,
                                          child: Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                SvgPicture.asset(
                                                  "assets/ic_password_change.svg",
                                                  color: Color.fromRGBO(143, 143,
                                                      143, 0.796078431372549),
                                                ),
                                                SvgPicture.asset(
                                                  "assets/icon_phone_call.svg",
                                                  width: 15,
                                                  height: 15,
                                                ),
                                              ]),
                                        ),
                                        SizedBox(width: 10),
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              Intl.message("number_tele",
                                                  name: "number_tele"),
                                              style: GoogleFonts.roboto(
                                                  color: ThemeColor.textPrimary,
                                                  fontStyle: FontStyle.normal,
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w400),
                                            ),
                                            Container(
                                              width: 200,
                                              child: Text(
                                                widget.datum.phone!,
                                                maxLines: 2,
                                                style: GoogleFonts.roboto(
                                                    color:
                                                        ThemeColor.textSecondary,
                                                    fontStyle: FontStyle.normal,
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.w400),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          SizedBox(
                            height: 10,
                          ),
                        ],
                      ),
                    ),
                  )),
              CustomBottomBar(-1, handleCallback)
            ],
          ),
        ],
      ),
    );
  }
}
