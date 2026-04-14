import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class StatusDialog extends StatelessWidget {
  StatusDialog(this.isSuccess, this.strMsg);

  final bool isSuccess;
  final String strMsg;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: EdgeInsets.symmetric(horizontal: 10.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Container(
        color: Color.fromRGBO(193, 221, 255, 0.10196078431372549),
        padding: EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(height: 20.0),
            Container(
                width: double.infinity,
                height: 120,
                child: Center(
                    child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Image.asset(
                    isSuccess ? "assets/checked.png" : "assets/cancel.png",
                    width: 80,
                    height: 80,
                  ),
                ))),
            SizedBox(height: 10.0),
            Text(
              strMsg,
              style: TextStyle(fontSize: 20, color: Colors.black),
            ),
            SizedBox(height: 20.0),
            FractionallySizedBox(
              widthFactor: 0.7,
                child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: Text(
                Intl.message("ok", name: "ok"),
                style: TextStyle(fontSize: 18, color: Colors.white),
              ),
              style: TextButton.styleFrom(
                backgroundColor: Colors.black,
                // Set the background color
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
            )),
            SizedBox(height: 10.0)
          ],
        ),
      ),
    );
  }
}
