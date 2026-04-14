import 'package:com.urbaevent/utils/Utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:com.urbaevent/widgets/CustomBottomBar.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher_string.dart';

class Plan extends StatefulWidget {
  final String locationLatLng;

  Plan(this.locationLatLng);

  @override
  State<StatefulWidget> createState() => _Plan();
}

class _Plan extends State<Plan> {
  GoogleMapController? _controller;
  String _mapStyle = '';

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
    _loadMapStyle();
  }

  void _loadMapStyle() async {
    _mapStyle = await rootBundle.loadString('assets/grey_style.json');
    if (_controller != null) {
      _controller!.setMapStyle(_mapStyle);
    }
  }

  void _onMarkerTapped(MarkerId markerId) {
    final regex = RegExp(r'(-?\d+\.\d+),(-?\d+\.\d+)');
    final match = regex.firstMatch(widget.locationLatLng);

    if (match != null) {
      double latitude = double.parse(match.group(1)!);
      double longitude = double.parse(match.group(2)!);

      LatLng latLng = LatLng(latitude, longitude);
      // Open the maps application with the tapped marker's location
      launchMaps(latLng.latitude, latLng.longitude);
    } else {
      print('Invalid input format');
    }
  }

  void launchMaps(double latitude, double longitude) async {
    final url =
        'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude';
    await launchUrlString(url, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final regex = RegExp(r'(-?\d+\.\d+),(-?\d+\.\d+)');
    final match = regex.firstMatch(widget.locationLatLng);
    LatLng? centerLocation;

    if (match != null) {
      double latitude = double.parse(match.group(1)!);
      double longitude = double.parse(match.group(2)!);

      centerLocation = LatLng(latitude, longitude);
    }

    return Scaffold(
      appBar: null,
      body: Stack(
        children: [
          Container(color: Color.fromRGBO(249, 249, 255, 1)),
          Column(
            children: [
              CustomToolbar(Intl.message("plan", name: "plan"), onCallBack,
                  Utils.notificationCount, false),
              Expanded(
                flex: 1,
                child: GoogleMap(
                  initialCameraPosition:
                      CameraPosition(target: centerLocation!, zoom: 12),
                  markers: {
                    Marker(
                      markerId: MarkerId('centerMarker'),
                      position: centerLocation,
                      onTap: () {
                        _onMarkerTapped(MarkerId('centerMarker'));
                      },
                    ),
                  },
                  onMapCreated: (GoogleMapController controller) {
                    _controller = controller;
                    if (_mapStyle.isNotEmpty) {
                      _controller!.setMapStyle(_mapStyle);
                    }
                  },
                ),
              ),
              CustomBottomBar(-1, handleCallback)
            ],
          ),
        ],
      ),
    );
  }
}
