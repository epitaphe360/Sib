import 'dart:io';

import 'package:flutter/material.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:flutter_svg/svg.dart';

class CustomBottomBar extends StatefulWidget {
  final Function(int) callback;

  int uiMode;

  CustomBottomBar(this.uiMode, this.callback);

  @override
  State<StatefulWidget> createState() => _CustomBottomBar();
}

class _CustomBottomBar extends State<CustomBottomBar> {
  int _height = 0;
  int role = -1;

  @override
  void initState() {
    super.initState();
    checkRole();
  }

  Future<void> checkRole() async {
    Preference preference = await Preference.getInstance();
    if (preference.getAuthRole() != null) {
      role = preference.getAuthRole()!.role!.id!;
    }
  }

  ColorFilter _getColorFilter(bool condition) {
    if (condition) {
      return ColorFilter.mode(
          Color.fromRGBO(69, 152, 209, 1), BlendMode.srcATop);
    } else {
      return ColorFilter.mode(Color.fromRGBO(51, 51, 51, 1), BlendMode.srcIn);
    }
  }

  Color _getColor(bool condition) {
    if (condition) {
      return Color.fromRGBO(69, 152, 209, 1);
    } else {
      return Color.fromRGBO(51, 51, 51, 1);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (Platform.isAndroid) {
      _height = 80;
    } else {
      _height = 100;
    }

    return Container(
      height: _height.toDouble(),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16.0), topRight: Radius.circular(16.0))),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Spacer(),
              if (role == 3) Spacer(),
              if (role == 3) Spacer(),
              IconButton(
                icon: SvgPicture.asset('assets/ic_home.svg',
                    fit: BoxFit.fitWidth,
                    color: _getColor(widget.uiMode == 0)),
                // Replace with your image asset path
                onPressed: () {
                  setState(() {
                    widget.uiMode = 0;
                  });
                  widget.callback(0);
                },
              ),
              Spacer(),
              if (role != 3)
                IconButton(
                  icon: Image.asset('assets/icon_contacts.png',width: 26,height: 26,
                      color: _getColor(widget.uiMode == 1)),
                  // Replace with your image asset path
                  onPressed: () {
                    setState(() {
                      widget.uiMode = 1;
                    });
                    widget.callback(1);
                  },
                ),
              Spacer(),
              IconButton(
                iconSize: 50,
                icon: Image.asset(
                  'assets/icon_scan.png',
                  width: 50,height: 50,
                ),
                // Replace with your image asset path
                onPressed: () {
                  setState(() {
                    widget.uiMode = 2;
                  });
                  widget.callback(2);
                },
              ),
              Spacer(),
              if (role != 3)
                IconButton(
                  icon: Image.asset('assets/icon_ebadge.png',width: 30,height: 30,
                      color: _getColor(widget.uiMode == 3)),
                  // Replace with your image asset path
                  onPressed: () {
                    setState(() {
                      widget.uiMode = 3;
                    });
                    widget.callback(3);
                  },
                ),
              Spacer(),
              IconButton(
                icon: Image.asset('assets/icon_profile.png',width: 23,height: 23,
                    color: _getColor(widget.uiMode == 4)),
                // Replace with your image asset path
                onPressed: () {
                  setState(() {
                    widget.uiMode = 4;
                  });
                  widget.callback(4);
                },
              ),
              if (role == 3) Spacer(),
              if (role == 3) Spacer(),
              Spacer(),
            ],
          ),
          if (Platform.isIOS)
            SizedBox(
              height: 10,
            )
        ],
      ),
    );
  }
}
