import 'dart:convert';
import 'dart:ui';

import 'package:com.urbaevent/generated/l10n.dart';
import 'package:com.urbaevent/model/ResponseAuthRole.dart';
import 'package:com.urbaevent/model/ResponseLogin.dart';
import 'package:com.urbaevent/model/agent/ResponseAgentAuth.dart';
import 'package:com.urbaevent/model/agent/ResponseGateList.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Preference {
  static Preference? _instance;
  static SharedPreferences? _preferences;

  static Future<Preference> getInstance() async {
    if (_instance == null) {
      _instance = Preference();
      await _instance!.initialize();
    }
    return _instance!;
  }

  Future<void> initialize() async {
    _preferences = await SharedPreferences.getInstance();
    await _preferences!.setString('preferenceName', 'SIB');
  }

  bool getFirstCheck() {
    return _preferences!.getBool('first_launch') ?? true;
  }

  void setFirstCheck(bool isFirstLaunch) async {
    await _preferences!.setBool('first_launch', isFirstLaunch);
  }

  void setUserId(int userId) async {
    await _preferences!.setInt('userId', userId);
  }

  int getUserId() {
    return _preferences!.getInt('userId') ?? 0;
  }

  // UUID (Supabase) — remplace l'int Strapi pour les nouveaux flows
  void setUserUUID(String uuid) async {
    await _preferences!.setString('userUUID', uuid);
  }

  String getUserUUID() {
    return _preferences!.getString('userUUID') ?? '';
  }

  void setToken(String token) async {
    await _preferences!.setString('token', token);
  }

  String getToken() {
    return _preferences!.getString('token') ?? "";
  }

  Future<void> saveLogin(ResponseAuth? responseLogin) async {
    final jsonString = json.encode(responseLogin!.toJson());
    await _preferences!.setString('responseLogin', jsonString);
  }

  ResponseAuth? getLoginDetails() {
    final jsonString = _preferences!.getString('responseLogin');
    if (jsonString != null) {
      final jsonMap = json.decode(jsonString);
      return ResponseAuth.fromJson(jsonMap);
    }
    return null;
  }

  Future<void> saveAuthRole(ResponseAuthRole? responseAuthRole) async {
    final jsonString = json.encode(responseAuthRole!.toJson());
    await _preferences!.setString('responseAuthRole', jsonString);
  }

  ResponseAuthRole? getAuthRole() {
    final jsonString = _preferences!.getString('responseAuthRole');
    if (jsonString != null) {
      final jsonMap = json.decode(jsonString);
      return ResponseAuthRole.fromJson(jsonMap);
    }
    return null;
  }

  Future<void> saveAuthRoleAgent(ResponseAgentAuth? responseAuthRole) async {
    final jsonString = json.encode(responseAuthRole!.toJson());
    await _preferences!.setString('responseAuthRoleAgent', jsonString);
  }

  ResponseAgentAuth? getAuthRoleAgent() {
    final jsonString = _preferences!.getString('responseAuthRoleAgent');
    if (jsonString != null) {
      final jsonMap = json.decode(jsonString);
      return ResponseAgentAuth.fromJson(jsonMap);
    }
    return null;
  }

  Future<void> setGateListResponse(ResponseGateList? responseGateList) async {
    final jsonString = json.encode(responseGateList!.toJson());
    await _preferences!.setString('gateList', jsonString);
  }

  ResponseGateList? getGateListResponse() {
    final jsonString = _preferences!.getString('gateList');
    if (jsonString != null) {
      final jsonMap = json.decode(jsonString);
      return ResponseGateList.fromJson(jsonMap);
    }
    return null;
  }

  Future<void> saveGate(GateItem? gateItem) async {
    final jsonString = json.encode(gateItem!.toJson());
    await _preferences!.setString('gateItem', jsonString);
  }

  GateItem? getGateItem() {
    final jsonString = _preferences!.getString('gateItem');
    if (jsonString != null) {
      final jsonMap = json.decode(jsonString);
      return GateItem.fromJson(jsonMap);
    }
    return null;
  }

  void setLanguage(String lang) async {
    await _preferences!.setString('lang', lang);
  }

  String getLanguage() {
    Locale deviceLocale = window.locale;
    return _preferences!.getString('lang') ?? deviceLocale.languageCode;
  }

  void setAppleName(String appleName) async {
    await _preferences!.setString('appleName', appleName);
  }

  String getAppleName() {
    return _preferences!.getString('appleName') ?? " ";
  }

  void setAppleUerId(String appleUserId) async {
    await _preferences!.setString('appleUserId', appleUserId);
  }


  String getAppleUserId(){
    return _preferences!.getString('appleUserId') ?? " ";
  }

  void setAppleEmail(String appleEmail) async {
    await _preferences!.setString('appleEmail', appleEmail);
  }


  String getAppleEmail(){
    return _preferences!.getString('appleEmail') ?? "";
  }

  void clearAppPreferences() {
    _preferences!.remove('token');
    _preferences!.remove('responseAuthRole');
    _preferences!.remove('responseLogin');
    _preferences!.remove('responseAuthRoleAgent');
    _preferences!.remove('userId');
  }
}
