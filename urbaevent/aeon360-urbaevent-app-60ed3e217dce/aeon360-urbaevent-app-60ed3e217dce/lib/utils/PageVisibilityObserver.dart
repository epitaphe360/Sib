import 'package:flutter/material.dart';

class PageVisibilityObserver with WidgetsBindingObserver, RouteAware {
  final Function(bool isVisible) onVisibilityChange;

  PageVisibilityObserver(this.onVisibilityChange);

  @override
  void didPopNext() {
    onVisibilityChange(true);
  }

  @override
  void didPushNext() {
    onVisibilityChange(false);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      onVisibilityChange(true);
    } else if (state == AppLifecycleState.paused) {
      onVisibilityChange(false);
    }
  }
}