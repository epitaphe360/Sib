import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/model/events/ResponseEbadges.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';

class EBadgeDetails extends StatefulWidget {
  final Datum datum;

  EBadgeDetails(this.datum);

  @override
  State<StatefulWidget> createState() => _EBadgeDetails();
}

class _EBadgeDetails extends State<EBadgeDetails> {
  bool loader = false;
  String type = "";

  Future<String> getType() async {
    Preference preference = await Preference.getInstance();
    if (preference.getLanguage() == "fr") {
      if (widget.datum.type.toLowerCase() == "visitor") {
        type = "Visiteur";
      } else if (widget.datum.type.toLowerCase() == "exhibitor") {
        type = "Exposant";
      } else {
        type = widget.datum.type;
      }
    } else {
      type = widget.datum.type;
    }
    return type;
  }

  @override
  Widget build(BuildContext context) {
    Future<http.Response> fetchEncryptedImage() async {
      final url = Urls.baseURL + Urls.viewQRCode + widget.datum.id.toString();

      Preference preference = await Preference.getInstance();

      final jwtToken = preference.getToken();

      final headers = {
        'Authorization': 'Bearer $jwtToken',
      };

      return http.get(Uri.parse(url), headers: headers);
    }

    Future<void> _downloadFile() async {
      try {
        setState(() {
          loader = true;
        });
        Preference preference = await Preference.getInstance();

        final jwtToken = preference.getToken();

        final url = Uri.parse(
            Urls.baseURL + Urls.downloadEbadge + widget.datum.id.toString());
        final response = await http.get(
          url,
          headers: {'Authorization': 'Bearer $jwtToken'},
        );

        if (response.statusCode == 200) {
          // Get the application's document directory
          final appDir = await getApplicationCacheDirectory();
          final filePath = appDir.path + '/' + widget.datum.event.name + '.pdf';

          // Create and write the file
          File file = File(filePath);
          await file.writeAsBytes(response.bodyBytes);

          // File saved successfully
          print('File saved to: $filePath');
          if (await file.exists()) {
            await OpenFile.open(filePath);
          } else {
            throw Exception('File does not exist at $filePath');
          }
          setState(() {
            loader = false;
          });
        } else {
          setState(() {
            loader = false;
          });
          // Handle the HTTP error
          throw Exception('Failed to download file: ${response.statusCode}');
        }
      } catch (e) {
        setState(() {
          loader = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }

    Future<void> requestPermission() async {
      // Define the permission you want to request
      DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();

      // Get Android device info
      PermissionStatus status;

      try {
        AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;

        if (int.parse(androidInfo.version.release) >= 13 &&
            Platform.isAndroid) {
          status = await Permission.photos.request();
        } else {
          status = await Permission.storage.request();
        }
      } catch (e) {
        status = await Permission.storage.request();
      }

      // Handle the permission status
      if (status.isGranted) {
        // Permission is granted
        _downloadFile();
      } else if (status.isDenied) {
        // Permission is denied
        print('Permission denied');
      } else if (status.isPermanentlyDenied) {
        // Permission is permanently denied, show a user-friendly dialog
        print('Permission permanently denied');
        openAppSettings(); // Open the app settings to allow the user to grant permission manually
      }
    }

    return Expanded(
      flex: 1,
      child: Container(
        child: Padding(
          padding: EdgeInsets.only(left: 16, right: 16, top: 5),
          child: Stack(
            children: [
              Align(
                alignment: Alignment.topCenter,
                child: Image.asset(
                  'assets/bg_badge_details.png',
                  width: MediaQuery.of(context).size.width - 40,
                ),
              ),
              Column(
                children: [
                  SizedBox(height: 10),
                  Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(width: 20),
                        Column(
                          children: [
                            SizedBox(height: 16),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              // Set the border radius here
                              child: CachedNetworkImage(
                                fit: BoxFit.cover,
                                height: 63,
                                width: 63,
                                imageUrl: Urls.imageURL +
                                    widget.datum.event.logo!.url,
                                // Replace with your image URL
                                placeholder: (context, url) => Container(
                                    alignment: Alignment.center,
                                    height: 50,
                                    child: Center(
                                        child: CircularProgressIndicator(
                                      color: Colors.black.withOpacity(0.2),
                                    ))),
                              ),
                            ),
                          ],
                        ),
                        Container(
                          margin: EdgeInsets.all(16),
                          alignment: Alignment.topLeft,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 220,
                                child: Text(
                                  widget.datum.event.name,
                                  style: GoogleFonts.roboto(
                                      color: Color.fromRGBO(69, 152, 209, 1),
                                      fontStyle: FontStyle.normal,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w700),
                                ),
                              ),
                              SizedBox(
                                height: 5,
                              ),
                              Row(
                                children: [
                                  Image.asset(
                                    'assets/ic_event.png',
                                    width: 14,
                                    height: 14,
                                  ),
                                  SizedBox(width: 10),
                                  Text(
                                    '${DateFormat('dd MMM yyyy').format(widget.datum.event.startDate)} - ${DateFormat('dd MMM yyyy').format(widget.datum.event.endDate)}',
                                    style: GoogleFonts.roboto(
                                        color: Color.fromRGBO(100, 116, 139, 1),
                                        fontStyle: FontStyle.normal,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w400),
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 5,
                              ),
                              Row(
                                children: [
                                  Image.asset(
                                    'assets/map_pin.png',
                                    width: 14,
                                    height: 14,
                                  ),
                                  SizedBox(width: 10),
                                  Container(
                                    width: 210,
                                    child: Text(
                                      widget.datum.event.locationAddress,
                                      style: GoogleFonts.roboto(
                                          color:
                                              Color.fromRGBO(100, 116, 139, 1),
                                          fontStyle: FontStyle.normal,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w400),
                                    ),
                                  ),
                                ],
                              )
                            ],
                          ),
                        )
                      ]),
                  SizedBox(
                    height: 10,
                  ),
                  Image.asset(
                    'assets/line.png',
                    width: MediaQuery.of(context).size.width - 100,
                    fit: BoxFit.cover,
                  ),
                  SizedBox(
                    height: 10,
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        alignment: Alignment.center,
                        width: 210,
                        child: Text(
                          widget.datum.user.name,
                          style: GoogleFonts.roboto(
                              color: Colors.black,
                              fontSize: 18,
                              height: 1.1,
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                      SizedBox(
                        height: 10,
                      ),
                      FutureBuilder<String>(
                        future: getType(),
                        builder: (context, snapshot) {
                          if (snapshot.connectionState ==
                              ConnectionState.waiting) {
                            return CircularProgressIndicator();
                          } else if (snapshot.hasError) {
                            return Text(' ');
                          } else if (!snapshot.hasData) {
                            return Text(' ');
                          } else {
                            return Text(
                              type.toUpperCase(),
                              style: GoogleFonts.roboto(
                                  color: Color.fromRGBO(69, 152, 209, 1),
                                  fontSize: 18,
                                  height: 1.1,
                                  fontWeight: FontWeight.w700),
                            );
                          }
                        },
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Text(
                        widget.datum.user.company ?? "",
                        style: GoogleFonts.roboto(
                            color: Color.fromRGBO(69, 152, 209, 1),
                            fontSize: 14,
                            height: 1.1,
                            fontWeight: FontWeight.w700),
                      ),
                      SizedBox(
                        height: 25,
                      ),
                      FutureBuilder<http.Response>(
                        future: fetchEncryptedImage(),
                        builder: (context, snapshot) {
                          if (snapshot.connectionState ==
                              ConnectionState.waiting) {
                            return CircularProgressIndicator();
                          } else if (snapshot.hasError) {
                            return Text('Error: ${snapshot.error}');
                          } else if (!snapshot.hasData ||
                              snapshot.data!.statusCode != 200) {
                            if (widget.datum.confirmed == true)
                              return Text('Failed to load image');
                            else
                              return Text(' ');
                          } else {
                            final encryptedImageBytes =
                                snapshot.data!.bodyBytes;
                            // Decrypt the encryptedImageBytes using your decryption logic
                            // Once decrypted, you can use the Image.memory widget to display it
                            return Image.memory(
                              encryptedImageBytes,
                              height: 160,
                              fit: BoxFit.fill,
                            );
                          }
                        },
                      ),
                      SizedBox(
                        height: 30,
                      ),
                      Image.asset(
                        'assets/line.png',
                        width: MediaQuery.of(context).size.width - 100,
                        fit: BoxFit.cover,
                      ),
                      SizedBox(
                        height: 30,
                      ),
                      if(widget.datum.confirmed == false)
                        Container(width: 280,
                          alignment: Alignment.center,
                          child: Text(
                            Intl.message("msg_request_rejected",
                                name: "msg_request_rejected"),
                            maxLines: 2,
                            style: GoogleFonts.roboto(
                                color: ThemeColor.textGrey,
                                fontSize: 18,
                                height: 1.1,
                                fontWeight: FontWeight.w700),
                          ),
                        ),
                      if (widget.datum.confirmed==null)
                        Container(width: 280,
                          alignment: Alignment.center,
                          child: Text(
                            Intl.message("msg_request_under_review",
                                name: "msg_request_under_review"),
                            maxLines: 2,
                            style: GoogleFonts.roboto(
                                color: ThemeColor.textGrey,
                                fontSize: 18,
                                height: 1.1,
                                fontWeight: FontWeight.w700),
                          ),
                        ),
                      if (widget.datum.confirmed == true)
                        TextButton(
                          onPressed: () async {
                            requestPermission();
                          },
                          child: Text(
                            Intl.message("click_to_download",
                                name: "click_to_download"),

                            style: GoogleFonts.roboto(
                                color: Color.fromRGBO(69, 152, 209, 1),
                                fontSize: 14,
                                height: 1.1,
                                fontWeight: FontWeight.w700),
                          ),
                        ),
                      if (widget.datum.confirmed == true)
                        GestureDetector(
                          onTap: (){
                            requestPermission();
                          },
                          child: Image.asset(
                            'assets/ic_download_badge.png',
                            width: 16,
                            height: 18,
                          ),
                        ),
                    ],
                  )
                ],
              ),
              if (loader) Progressbar(loader)
            ],
          ),
        ),
      ),
    );
  }
}
