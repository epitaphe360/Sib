import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/adapter_view/DayInfoItem.dart';
import 'package:com.urbaevent/adapter_view/DayInfoItemSecondary.dart';
import 'package:com.urbaevent/adapter_view/EventDayNumber.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';
import 'package:com.urbaevent/model/events/ResponseSchedule.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';

import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomBottomBar.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class MySchedule extends StatefulWidget {
  final int id;

  MySchedule(this.id);

  @override
  State<StatefulWidget> createState() => _MySchedule();
}

class _MySchedule extends State<MySchedule> {
  bool loader = false;
  ResponseSchedule? responseSchedule;
  int pageIndex = 0;
  bool init = false;
  int selectedDayIndex = -1;
  List<DayInfo> filteredInfo = [];

  Future<void> getMyScheduleList() async {
    setState(() {
      loader = true;
    });
    Preference preference = await Preference.getInstance();

    final jwtToken = preference.getToken();

    if (jwtToken.isNotEmpty) {
      final url = Uri.parse(Urls.baseURL +
          Urls.mySchedule +
          preference.getUserId().toString() +
          Urls.myScheduleListFilter1 +
          widget.id.toString() +
          Urls.myScheduleListFilter2);
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $jwtToken'},
      );

      final parsedJson = jsonDecode(response.body);

      if (response.statusCode == HttpStatus.ok) {
        print('Response' + response.body);
        setState(() {
          responseSchedule = ResponseSchedule.fromJson(parsedJson);
          filteredInfo = ResponseSchedule.fromJson(parsedJson).data!;
          if (responseSchedule!.data!.length > 0) {
            filteredInfo[0].index = pageIndex;
            responseSchedule!.data![0].index = pageIndex;
            for (int i = 1; i < responseSchedule!.data!.length; i++) {
              int result = responseSchedule!.data![i].date!
                  .compareTo(responseSchedule!.data![i - 1].date!);
              if (result > 0) {
                pageIndex++;
              }
              filteredInfo[i].index = pageIndex;
              responseSchedule!.data![i].index = pageIndex;
            }
          }
          init = true;
        });
      } else {
        print('Response Error' + response.body);
        final error = ResponseError.fromJson(parsedJson);
        Utils.showToast(error.error.message);
      }
    } else {
      Navigator.pop(context);
    }
    setState(() {
      loader = false;
    });
  }

  void onCallBack() {
    setState(() {
      Navigator.pop(context);
    });
  }

  void handleCallback(int val) {
    setState(() {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => HomePage(val)),
        (route) => false,
      );
    });
  }

  void onDayItemClick(int val) {
    setState(() {
      selectedDayIndex = val;
      filterItems();
    });
  }

  @override
  void initState() {
    super.initState();
    // Set the initial status bar color to transparent
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
    ));
    getMyScheduleList();
  }

  void filterItems() {
    setState(() {
      // If the query is empty, display the initial list
      if (selectedDayIndex == -1) {
        filteredInfo.clear();
        filteredInfo.addAll(responseSchedule!.data!);
      } else {
        // Otherwise, filter the items based on the query
        filteredInfo = responseSchedule!.data!
            .where((item) => item.index == selectedDayIndex)
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final PageController controllerUpcomingEvents =
        PageController(viewportFraction: 1, initialPage: 0);

    return Scaffold(
      appBar: null,
      body: Stack(
        children: [
          Container(color: Color.fromRGBO(249, 249, 255, 1)),
          Column(
            children: [
              CustomToolbar(Intl.message("my_schedule", name: "my_schedule"), onCallBack, Utils.notificationCount, false),
              if (responseSchedule != null &&
                  responseSchedule!.data != null &&
                  responseSchedule!.data!.length > 0 &&
                  init)
                Expanded(
                  flex: 1,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: pageIndex+1,
                    itemBuilder: (context, index) {
                      return EvenDayNumber(
                          index, selectedDayIndex, onDayItemClick);
                    },
                    // reverse: true,
                    physics: BouncingScrollPhysics(),
                    controller: controllerUpcomingEvents,
                  ),
                ),
              if (filteredInfo.length > 0 && init)
                Expanded(
                  flex: 7,
                  child: ListView.builder(
                    scrollDirection: Axis.vertical,
                    itemCount: filteredInfo.length,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return DayInfoItem(filteredInfo[index].index! + 1,
                            filteredInfo[index]);
                      } else if (index > 0) {
                        int result = filteredInfo[index]
                            .date!
                            .compareTo(filteredInfo[index - 1].date!);
                        if (result > 0) {
                          return DayInfoItem(filteredInfo[index].index! + 1,
                              filteredInfo[index]);
                        } else {
                          return DayInfoItemSecondary(
                              index, filteredInfo[index]);
                        }
                      } else {
                        return DayInfoItem(filteredInfo[index].index! + 1,
                            filteredInfo[index]);
                      }
                    },
                    // reverse: true,
                    physics: BouncingScrollPhysics(),
                    controller: controllerUpcomingEvents,
                  ),
                ),
              if (responseSchedule != null &&
                  responseSchedule!.data != null &&
                  responseSchedule!.data!.length == 0)
                Expanded(
                  flex: 1,
                  child: Center(
                    child: Text(
                      Intl.message("no_schedule", name: "no_schedule"),
                      style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontStyle: FontStyle.normal,
                          fontSize: 12,
                          fontWeight: FontWeight.w400),
                    ),
                  ),
                ),
              if (responseSchedule == null)
                Expanded(
                  flex: 1,
                  child: Container(),
                ),
              CustomBottomBar(-1, handleCallback)
            ],
          ),
          if (loader) Progressbar(loader),
        ],
      ),
    );
  }
}
