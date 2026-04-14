import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:com.urbaevent/adapter_view/NotificationItem.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/model/ResponseNotifications.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomBottomBar.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class NotificationList extends StatefulWidget {
  final title;

  NotificationList({this.title});

  @override
  State<StatefulWidget> createState() => _NotificationList();
}

class _NotificationList extends State<NotificationList> {
  bool loader = false;
  ResponseNotifications? responseNotifications;
  String strTitle = Intl.message("notifications", name: "notifications");
  int lastReadIndex = 0;

  void onCallBack() {
    setState(() {
      Navigator.pop(context);
    });
  }

  Future<void> setReadIndexForNotifications() async {
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();

    if (jwtToken.isNotEmpty) {
      final url = Uri.parse(Urls.baseURL +
          Urls.notificationReadIndex +
          preference.getUserId().toString());
      final response = await http.put(url, headers: {
        'Authorization': 'Bearer $jwtToken'
      }, body: {
        "lastNotificationIndex":
            (responseNotifications!.data!.length - 1).toString()
      });

      final parsedJson = jsonDecode(response.body);

      if (response.statusCode == HttpStatus.ok) {

        preference.getAuthRole()!.lastNotificationIndex =
            responseNotifications!.data!.length - 1;
      } else if (response.statusCode == HttpStatus.unauthorized) {
        setState(() {
          loader = false;
          preference.clearAppPreferences();
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => HomePage(Const.homeUI)),
            (route) => false,
          );
        });
      } else {
        print('Response Error' + response.body);
        final error = ResponseError.fromJson(parsedJson);
        Utils.showToast(error.error.message);
      }
    }
  }

  Future<void> getNotifications() async {
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();

    if (jwtToken.isNotEmpty) {
      setState(() {
        loader = true;
      });

      if (preference.getAuthRole() != null &&
          preference.getAuthRole()!.lastNotificationIndex != null) {
        lastReadIndex = preference.getAuthRole()!.lastNotificationIndex!;
      }

      final url = Uri.parse(Urls.baseURL + Urls.notificationList);
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      final parsedJson = jsonDecode(response.body);

      if (response.statusCode == HttpStatus.ok) {
        print('Response Notification' + response.body);
        setState(() {
          loader = false;
          responseNotifications = ResponseNotifications.fromJson(parsedJson);
          int unreadCount = 0;
          if (lastReadIndex > 0) {
            unreadCount =
                (responseNotifications!.data!.length - 1) - lastReadIndex;
          } else {
            unreadCount = (responseNotifications!.data!.length);
          }
          if (unreadCount > 0) {
            strTitle = strTitle + " ($unreadCount)";
          }
          Timer(Duration(seconds: 5), () {
            setReadIndexForNotifications();
          });
        });
      } else if (response.statusCode == HttpStatus.unauthorized) {
        setState(() {
          loader = false;
          preference.clearAppPreferences();
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => HomePage(Const.homeUI)),
            (route) => false,
          );
        });
      } else {
        setState(() {
          loader = false;
        });
        print('Response Error' + response.body);
        final error = ResponseError.fromJson(parsedJson);
        Utils.showToast(error.error.message);
      }
    } else {
      setState(() {
        loader = false;
      });
    }
  }

  void handleCallback(int val) {
    setState(() {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => HomePage(val)),
      );
    });
  }

  @override
  void initState() {
    super.initState();
    getNotifications();
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
              CustomToolbar(strTitle, onCallBack, -1, false),
              if (responseNotifications != null &&
                  responseNotifications!.data!.isNotEmpty)
                Expanded(
                  flex: 1,
                  child: ListView.builder(
                    padding: EdgeInsets.zero,
                    scrollDirection: Axis.vertical,
                    itemCount: responseNotifications!.data!.length,
                    itemBuilder: (context, index) {
                      return NotificationItem(
                          index,
                          responseNotifications!.data![index],
                          index <= lastReadIndex);
                    },
                    // reverse: true,
                    physics: BouncingScrollPhysics(),
                  ),
                ),
              if (responseNotifications != null &&
                  responseNotifications!.data!.isEmpty)
                Expanded(
                  flex: 1,
                  child: Center(
                    child: Text(
                      Intl.message("no_notifications",
                          name: "no_notifications"),
                      style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontStyle: FontStyle.normal,
                          fontSize: 18,
                          fontWeight: FontWeight.w400),
                    ),
                  ),
                ),
              if (responseNotifications == null)
                Expanded(flex: 1, child: Container()),
              CustomBottomBar(-1, handleCallback)
            ],
          ),
          if (loader) Progressbar(loader),
        ],
      ),
    );
  }
}
