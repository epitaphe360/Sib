import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';

 class Utils {

  static int notificationCount=0;

  static String capitalizeFirstLetter(String text) {
    if (text.isEmpty) {
      return text; // Return the original string if it's null or empty.
    }

    return text[0].toUpperCase() + text.substring(1);
  }

  static void showToast(String msg) {
    Fluttertoast.showToast(
      msg: msg,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      timeInSecForIosWeb: 1,
      backgroundColor: Colors.black.withOpacity(0.5), // Custom background color
      textColor: Colors.white, // Custom text color
      fontSize: 16.0, // Custom font size
      webBgColor: "#000000", // Custom background color for web
      webPosition: "center", // Custom position for web
    );
  }

 static void showDialogMessage(BuildContext context,String strMessage) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          content: Text(strMessage),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text("OK"),
            ),
          ],
        );
      },
    );
  }

 static List<T> cloneList<T>(List<T> originalList) {
    return List<T>.from(originalList);
  }

  static String obfuscateEmail(String email) {
    if (email.isEmpty) {
      return email;
    }

    final parts = email.split('@');
    if (parts.length != 2) {
      return email;
    }

    final username = parts[0];
    final domain = parts[1];

    if (username.length < 2) {
      return email; // Don't obfuscate if the username is too short
    }

    final obfuscatedUsername = '${username.substring(0, 2)}${'*' * (username.length - 2)}';
    final obfuscatedEmail = '$obfuscatedUsername@$domain';

    return obfuscatedEmail;
  }
}
