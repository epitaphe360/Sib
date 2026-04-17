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
import 'package:com.urbaevent/services/SupabaseService.dart';
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

    final uuid = preference.getUserUUID();

    if (uuid.isNotEmpty) {
      try {
        await SupabaseService.instance
            .setNotificationReadIndex(responseNotifications!.data!.length - 1);

        preference.getAuthRole()!.lastNotificationIndex =
            responseNotifications!.data!.length - 1;
      } catch (e) {
        debugPrint('setReadIndexForNotifications error: $e');
      }
    }
  }

  Future<void> getNotifications() async {
    Preference preference = await Preference.getInstance();

    final uuid = preference.getUserUUID();

    if (uuid.isNotEmpty) {
      setState(() {
        loader = true;
      });

      if (preference.getAuthRole() != null &&
          preference.getAuthRole()!.lastNotificationIndex != null) {
        lastReadIndex = preference.getAuthRole()!.lastNotificationIndex!;
      }

      try {
        final notifications = await SupabaseService.instance.getNotifications();

        setState(() {
          loader = false;
          responseNotifications = ResponseNotifications(
            data: notifications.map((n) {
              return Datum(
                id: n['id'] is int ? n['id'] : 0,
                text: n['text'] ?? '',
                createdAt: n['created_at'] != null ? DateTime.tryParse(n['created_at']) : null,
                updatedAt: n['updated_at'] != null ? DateTime.tryParse(n['updated_at']) : null,
              );
            }).toList(),
          );
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
      } catch (e) {
        setState(() {
          loader = false;
        });
        debugPrint('getNotifications error: $e');
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
