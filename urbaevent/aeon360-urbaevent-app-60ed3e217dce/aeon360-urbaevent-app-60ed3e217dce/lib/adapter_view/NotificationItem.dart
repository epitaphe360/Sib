import 'package:com.urbaevent/utils/Preference.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../model/ResponseNotifications.dart';

class NotificationItem extends StatefulWidget {
  final int index;
  final isRead;
  final Datum datum;

  NotificationItem(this.index, this.datum, this.isRead);

  @override
  State<NotificationItem> createState() => _NotificationItem();
}

class _NotificationItem extends State<NotificationItem> {
  String time = "";

  Future<void> getTimeDifference() async {
    DateTime startTime =
        widget.datum.updatedAt!; // Replace with your start date and time
    DateTime endTime = DateTime.now(); // Replace with your end date and time

    // Calculate the time difference between the two DateTime objects.
    Duration difference = endTime.difference(startTime);

    // Calculate years, months, days, hours, and minutes.
    int years = difference.inDays ~/ 365;
    int months = (difference.inDays % 365) ~/ 30;
    int days = difference.inDays % 30;
    int hours = difference.inHours % 24;
    int minutes = difference.inMinutes % 60;
    Preference preference = Preference();
    String langCode = preference.getLanguage();

    String modifiedContent;
    if (langCode == "en") {
      if (years > 0) {
        modifiedContent =
            years.toString() + Intl.message('years_ago', name: 'years_ago');
      } else if (months > 0) {
        modifiedContent =
            months.toString() + Intl.message('months_ago', name: 'months_ago');
      } else if (days > 0) {
        modifiedContent =
            days.toString() + Intl.message('days_ago', name: 'days_ago');
      } else if (hours > 0) {
        modifiedContent =
            hours.toString() + Intl.message('hours_ago', name: 'hours_ago');
      } else if (minutes > 0) {
        modifiedContent =
            hours.toString() + Intl.message('mins_ago', name: 'mins_ago');
      } else {
        modifiedContent = Intl.message('just_now', name: 'just_now');
      }
    } else {
      if (years > 0) {
        String yearsString = Intl.message('years_ago', name: 'years_ago');
        modifiedContent = '$yearsString $years ans';
      } else if (months > 0) {
        String monthsString = Intl.message('months_ago', name: 'months_ago');
        modifiedContent = '$monthsString $months mois';
      } else if (days > 0) {
        String daysString = Intl.message('days_ago', name: 'days_ago');
        modifiedContent = '$daysString $days jours';
      } else if (hours > 0) {
        String hoursString = Intl.message('hours_ago', name: 'hours_ago');
        modifiedContent = '$hoursString $hours heures';
      } else if (minutes > 0) {
        String minutesString = Intl.message('mins_ago', name: 'mins_ago');
        modifiedContent = '$minutesString $minutes jours';
      } else {
        modifiedContent = Intl.message('just_now', name: 'just_now');
      }
    }
    setState(() {
      time = modifiedContent;
    });
  }

  @override
  void initState() {
    super.initState();
    getTimeDifference();
  }

  @override
  Widget build(BuildContext context) {
    String strNotiIcon = "";
    // Define two DateTime objects for the start and end times.

    if (widget.isRead) {
      strNotiIcon = "assets/ic_noti_bell_read.svg";
    } else {
      strNotiIcon = "assets/ic_noti_bell.svg";
    }
    Color bgColor;
    if (widget.isRead) {
      bgColor = Colors.white;
    } else {
      bgColor = Color.fromRGBO(69, 152, 209, 0.20);
    }

    return Card(
      margin: new EdgeInsets.only(top: 16.0, left: 16, right: 16),
      shadowColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      color: bgColor,
      child: Container(
        decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
        constraints: BoxConstraints(
          minHeight: 100, // Minimum height of 100
        ),
        child: Row(children: [
          SizedBox(width: 20),
          SvgPicture.asset(strNotiIcon),
          Expanded(
            flex: 1,
            child: Container(
              margin: EdgeInsets.all(15),
              alignment: Alignment.topLeft,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Add some space between the text widgets
                  Html(data: widget.datum.text)
                ],
              ),
            ),
          ),
          SizedBox(
            width: 10,
          ),
          Center(
            child: Text(
              time,
              style: GoogleFonts.roboto(
                  color: Color.fromRGBO(100, 116, 139, 1),
                  fontStyle: FontStyle.normal,
                  fontSize: 16,
                  fontWeight: FontWeight.w400),
            ),
          ),
          SizedBox(
            width: 20,
          ),
        ]),
      ),
    );
  }
}
