import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/adapter_view/Portal.dart';
import 'package:com.urbaevent/model/ResponseBusinessSector.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';
import 'package:com.urbaevent/model/events/ResponsePortal.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomBottomBar.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class PortalList extends StatefulWidget {
  final int id;

  PortalList(this.id);

  @override
  State<StatefulWidget> createState() => _PortalList();
}

class _PortalList extends State<PortalList> {
  ResponsePortal? responsePortal;
  List<PortalItem> filteredPortal = [];
  bool loader = false;
  ResponseBusinessSector? responseBusinessSector;
  final List<String> items = [];
  TextEditingController textEditingController = TextEditingController();

  Future<void> getBusinessSector() async {

    final url = Uri.parse(Urls.baseURL + Urls.businessSector);

    final response = await http.get(url);
    final parsedJson = jsonDecode(response.body);
    if (response.statusCode == HttpStatus.ok) {
      responseBusinessSector = ResponseBusinessSector.fromJson(parsedJson);
      for (int i = 0; i < responseBusinessSector!.data!.length; i++) {
        items.add(responseBusinessSector!.data![i].name!);
      }
    } else {
      print('Error' + response.body);
      final error = ResponseError.fromJson(parsedJson);
      Utils.showToast(error.error.message);
    }

  }

  void filterItems(String query) {
    setState(() {
      // If the query is empty, display the initial list
      if (query.isEmpty) {
        filteredPortal.clear();
        filteredPortal.addAll(responsePortal!.data!);

        filteredPortal.sort((a, b) => a.user!.company!.compareTo(b.user!.company!));
      } else {
        // Otherwise, filter the items based on the query

        filteredPortal = responsePortal!.data!
            .where((item) =>
            item.user!.company!.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  Future<void> getPortalList() async {
    setState(() {
      loader = true;
    });

    final url = Uri.parse(Urls.baseURL +
        Urls.portalList +
        widget.id.toString() +
        Urls.portalListFilter1);
    final response = await http.get(url);

    final parsedJson = jsonDecode(response.body);

    if (response.statusCode == HttpStatus.ok) {
      log('Response' + response.body);
      setState(() {
        responsePortal = ResponsePortal.fromJson(parsedJson);
        filteredPortal = ResponsePortal.fromJson(parsedJson).data!;
        filteredPortal.sort((a, b) => a.user!.company!.compareTo(b.user!.company!));
      });
    } else {
      print('Response Error' + response.body);
      final error = ResponseError.fromJson(parsedJson);
      Utils.showToast(error.error.message);
    }
    setState(() {
      loader = false;
    });
  }

  final GlobalKey _anchorKey = GlobalKey();
  OverlayEntry? _overlayEntry;

  int _selectedIndex = -1; // Index of the selected item

  void _showAnchoredDialog(BuildContext context, Offset anchorOffset) {
    final OverlayState overlayState = Overlay.of(context);

    _overlayEntry = OverlayEntry(
      builder: (BuildContext context) {
        return Stack(
          children: [
            GestureDetector(
              onTap: () {
                _overlayEntry?.remove();
              },
              child: Container(
                color: Colors.black.withOpacity(0.12), // Background dim effect
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height,
              ),
            ),
            Positioned(
              left: 90,
              top: anchorOffset.dy + 30, // Adjust the offset as needed
              child: Card(
                  elevation: 2,
                  shadowColor:
                      Color.fromRGBO(158, 158, 158, 0.2549019607843137),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                  color: Colors.white,
                  child: Container(
                      decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
                      width: 250,
                      height: 250,
                      child: ListView.builder(
                        itemCount: items.length,
                        itemBuilder: (BuildContext context, int index) {
                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                if (index == _selectedIndex) {
                                  _selectedIndex = -1;
                                  _overlayEntry?.remove();
                                } else {
                                  _selectedIndex = index;
                                  _overlayEntry?.remove();
                                }
                                filterItems(
                                    textEditingController.text.toString());
                              });
                            },
                            child: Padding(
                              padding:
                                  const EdgeInsets.only(left: 10.0, right: 10),
                              child: Container(
                                height: 40.0,
                                color: _selectedIndex == index
                                    ? Color.fromRGBO(
                                        69, 152, 209, 0.15) // Highlighted color
                                    : Colors.transparent,
                                child: Align(
                                  alignment: Alignment.centerLeft,
                                  child: Padding(
                                    padding:
                                        EdgeInsets.only(left: 10, right: 10),
                                    child: Text(
                                      items[index],
                                      style: GoogleFonts.roboto(
                                          color:
                                              Color.fromRGBO(163, 158, 158, 1),
                                          fontStyle: FontStyle.normal,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ))),
            ),
          ],
        );
      },
    );

    overlayState.insert(_overlayEntry!);
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

  @override
  void initState() {
    super.initState();
    // Set the initial status bar color to transparent
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
    ));
    getPortalList();
    //getBusinessSector();
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
              CustomToolbar(Intl.message("portal", name: "portal"), onCallBack,
                  Utils.notificationCount, false),
              Container(
                height: 50,
                width: MediaQuery.of(context).size.width - 36,
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(
                      Radius.circular(30.0),
                    )),
                child: Stack(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        IconButton(
                          iconSize: 20,
                          icon: SvgPicture.asset(
                            'assets/ic_search_clear.svg',
                            width: 15,
                            height: 15,
                          ),
                          // Replace with your image asset path
                          onPressed: () {},
                        ),
                        Expanded(
                          child: Center(
                            child: TextField(
                              controller: textEditingController,
                              onChanged: filterItems,
                              decoration: InputDecoration(
                                hintText:
                                    Intl.message("search", name: "search"),
                                hintStyle: TextStyle(
                                    color: Color.fromRGBO(
                                        132, 130, 130, 0.803921568627451)),
                                border: InputBorder.none,
                              ),
                              style: GoogleFonts.roboto(
                                  fontSize: 18.0,
                                  fontWeight: FontWeight.w400,
                                  color: Color.fromRGBO(0, 0, 0, 1.0)),
                            ),
                          ),
                        ),
                        /*IconButton(
                          iconSize: 30,
                          icon: SvgPicture.asset(
                            'assets/ic_filter.svg',
                            width: 18,
                            height: 18,
                          ),
                          // Replace with your image asset path
                          key: _anchorKey,
                          onPressed: () {
                            final RenderBox renderBox =
                                _anchorKey.currentContext!.findRenderObject()
                                    as RenderBox;
                            final anchorPosition =
                                renderBox.localToGlobal(Offset.zero);
                            _showAnchoredDialog(context, anchorPosition);
                          },
                        )*/
                      ],
                    )
                  ],
                ),
              ),
              if (responsePortal != null && responsePortal!.data!.length > 0)
                Expanded(
                    child: Padding(
                  padding: EdgeInsets.only(left: 16, right: 16),
                  child: GridView.builder(
                    itemCount: filteredPortal.length,
                    // Replace with the actual number of items
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 4,
                        mainAxisSpacing: 4,
                        childAspectRatio: 0.70),
                    itemBuilder: (BuildContext context, int index) {
                      // Replace with your widget creation logic
                      return Portal(
                          filteredPortal[index]); // Your custom widget
                    },
                  ),
                )),
              if (responsePortal != null && responsePortal!.data!.length == 0)
                Expanded(
                  flex: 1,
                  child: Center(
                    child: Text(
                      Intl.message("no_portals", name: "no_portals"),
                      style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontStyle: FontStyle.normal,
                          fontSize: 12,
                          fontWeight: FontWeight.w400),
                    ),
                  ),
                ),
              if (responsePortal == null)
                Expanded(
                  flex: 1,
                  child: Container(),
                ),
              CustomBottomBar(-1, handleCallback)
            ],
          ),
        ],
      ),
    );
  }
}
