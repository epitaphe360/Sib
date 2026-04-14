import 'package:flutter/material.dart';

class HalfImageVisible extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return OverflowBox(
      alignment: Alignment.topRight,
      maxWidth: MediaQuery.of(context).size.width +
          100, // Adjust this value as needed
      child: ClipRect(
        child: Container(
          width: 280,
          height: 120,
          child: Image.asset(
            'assets/bg_top.png',
            fit: BoxFit.cover,
          ),
        ),
      ),
    );
  }
}