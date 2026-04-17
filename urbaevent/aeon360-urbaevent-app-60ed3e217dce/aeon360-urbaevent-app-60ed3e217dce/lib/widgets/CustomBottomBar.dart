import 'dart:io';

import 'package:flutter/material.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:flutter_svg/svg.dart';

class CustomBottomBar extends StatefulWidget {
  final Function(int) callback;

  final int uiMode;

  CustomBottomBar(this.uiMode, this.callback);

  @override
  State<StatefulWidget> createState() => _CustomBottomBar();
}

class _CustomBottomBar extends State<CustomBottomBar> {
  int role = -1;
  late int _uiMode;

  @override
  void initState() {
    super.initState();
    _uiMode = widget.uiMode;
    checkRole();
  }

  Future<void> checkRole() async {
    Preference preference = await Preference.getInstance();
    final authRole = preference.getAuthRole();
    if (authRole?.role?.id != null) {
      setState(() {
        role = authRole!.role!.id!;
      });
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
    final double bottomInset = MediaQuery.of(context).padding.bottom;
    final double baseHeight = Platform.isAndroid ? 65.0 : 75.0;

    return Container(
      height: baseHeight + bottomInset,
      padding: EdgeInsets.only(bottom: bottomInset),
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
                    colorFilter: ColorFilter.mode(_getColor(_uiMode == 0), BlendMode.srcIn)),
                // Replace with your image asset path
                onPressed: () {
                  setState(() {
                    _uiMode = 0;
                  });
                  widget.callback(0);
                },
              ),
              Spacer(),
              if (role != 3)
                IconButton(
                  icon: Image.asset('assets/icon_contacts.png',width: 26,height: 26,
                      color: _getColor(_uiMode == 1)),
                  // Replace with your image asset path
                  onPressed: () {
                    setState(() {
                      _uiMode = 1;
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
                    _uiMode = 2;
                  });
                  widget.callback(2);
                },
              ),
              Spacer(),
              if (role != 3)
                IconButton(
                  icon: Image.asset('assets/icon_ebadge.png',width: 30,height: 30,
                      color: _getColor(_uiMode == 3)),
                  // Replace with your image asset path
                  onPressed: () {
                    setState(() {
                      _uiMode = 3;
                    });
                    widget.callback(3);
                  },
                ),
              Spacer(),
              IconButton(
                icon: Image.asset('assets/icon_profile.png',width: 23,height: 23,
                    color: _getColor(_uiMode == 4)),
                // Replace with your image asset path
                onPressed: () {
                  setState(() {
                    _uiMode = 4;
                  });
                  widget.callback(4);
                },
              ),
              if (role == 3) Spacer(),
              if (role == 3) Spacer(),
              Spacer(),
            ],
          ),
        ],
      ),
    );
  }
}

