
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/widgets/CustomBottomBar.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:intl/intl.dart';
import 'package:webview_flutter/webview_flutter.dart';

class EventPresentation extends StatefulWidget {
  final String url;

  EventPresentation(this.url);

  @override
  State<StatefulWidget> createState() => _EventPresentation();
}

class _EventPresentation extends State<EventPresentation> {


  void onCallBack() {
    setState(() {
      Navigator.pop(context);
    });
  }

  void handleCallback(int val) {
    setState(() {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => HomePage(val)),(route) => false,
      );
    });
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
     WebViewController controller =
    WebViewController.fromPlatformCreationParams(PlatformWebViewControllerCreationParams());
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse(widget.url));
    return Scaffold(
      appBar: null,
      body: Stack(
        children: [
          Container(color: Color.fromRGBO(249, 249, 255, 1)),
          Column(
            children: [
              CustomToolbar(Intl.message("presentation", name: "presentation"), onCallBack, Utils.notificationCount, false),
              Expanded(
                flex: 1,
                child: Container(
                  child: WebViewWidget(controller: controller),
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
