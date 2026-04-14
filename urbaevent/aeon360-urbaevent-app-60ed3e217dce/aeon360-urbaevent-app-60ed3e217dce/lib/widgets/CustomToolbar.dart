
import 'package:flutter/material.dart';
import 'package:com.urbaevent/ui/content_ui/event/sub_views/MyAssociates.dart';
import 'package:com.urbaevent/ui/content_ui/home/NotificationList.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';

import '../utils/ThemeColor.dart';

class CustomToolbar extends StatefulWidget {
  final Function() callback;

  final String strMsg;

  final int notificationCount;

  final bool isExhibitor;

  CustomToolbar(
      this.strMsg, this.callback, this.notificationCount, this.isExhibitor);

  @override
  State<StatefulWidget> createState() => _CustomToolbar();
}

class _CustomToolbar extends State<CustomToolbar> {
  String labelText = "";

  @override
  void initState() {
    super.initState();
    labelText = widget.strMsg;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 100,
      child: Column(
        children: [
          SizedBox(
            height: 40,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              SizedBox(
                width: 10,
              ),
              IconButton(
                iconSize: 40,
                icon: SvgPicture.asset(
                  'assets/ic_back_bt.svg',
                  width: 40,
                  height: 40,
                ),
                // Replace with your image asset path
                onPressed: () {
                  setState(() {
                    widget.callback();
                  });
                },
              ),
              Expanded(
                flex: 4,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      widget.strMsg,
                      style: GoogleFonts.roboto(
                          color: ThemeColor.textPrimary,
                          fontSize: 22,
                          height: 1.1,
                          fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
              if (widget.notificationCount == -1)
                SizedBox(
                  width: 50,
                ),
                Row(
                  children: [
                    if (widget.isExhibitor)
                      IconButton(
                        iconSize: 40,
                        icon: SvgPicture.asset(
                          'assets/ic_associates.svg',
                          width: 40,
                          height: 40,
                          fit: BoxFit.cover,
                        ),
                        // Replace with your image asset path
                        onPressed: () {
                          setState(() {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => MyAssociates()),
                            );
                          });
                        },
                      ),
                    if (widget.notificationCount > -1)
                      IconButton(
                        iconSize: 40,
                        icon: Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: 40.0, // Adjust the size as needed
                              height: 40.0,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white,
                              ),
                            ),
                            SvgPicture.asset(
                              'assets/ic_noti.svg',
                              width: 20,
                              height: 20,
                              fit: BoxFit.cover,
                            ),
                            if (widget.notificationCount > 0)
                              Positioned(
                                top: 4.0,
                                // Adjust the top and right values as needed
                                right: 6.0,
                                child: Container(
                                  alignment: Alignment.center,
                                  // Adjust the width and height as needed
                                  height: 18.0,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: ThemeColor.colorAccent,
                                  ),
                                  child: Center(
                                    child: Padding(
                                      padding: const EdgeInsets.all(4.0),
                                      child: Text(
                                        widget.notificationCount.toString(),
                                        // Text inside the badge
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        // Replace with your image asset path
                        onPressed: () {
                          setState(() {
                            Navigator.push(
                              context,
                              PageRouteBuilder(
                                pageBuilder: (context,
                                    animation,
                                    secondaryAnimation) =>
                                    NotificationList(),
                                transitionsBuilder:
                                    (context,
                                    animation,
                                    secondaryAnimation,
                                    child) {
                                  const begin = Offset(1.0,
                                      0.0); // Slide from right
                                  const end = Offset.zero;
                                  const curve =
                                      Curves.easeInOut;
                                  var tween = Tween(
                                      begin: begin,
                                      end: end)
                                      .chain(CurveTween(
                                      curve: curve));
                                  var offsetAnimation =
                                  animation
                                      .drive(tween);
                                  return SlideTransition(
                                      position:
                                      offsetAnimation,
                                      child: child);
                                },
                              ),
                            );
                          });
                        },
                      )
                  ],
                ),
              SizedBox(
                width: 10,
              )
            ],
          ),
        ],
      ),
    );
  }
}
