import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';
import '../generated/intl/messages_all.dart';

class LanguageProvider with ChangeNotifier {
  Locale _locale = Locale('fr', '');

  Locale get locale => _locale;

  Future<void> changeLanguage(Locale newLocale) async {
    _locale = newLocale;
    Intl.defaultLocale = _locale.languageCode;
    await initializeMessages(_locale.languageCode);
    notifyListeners();
  }
}
