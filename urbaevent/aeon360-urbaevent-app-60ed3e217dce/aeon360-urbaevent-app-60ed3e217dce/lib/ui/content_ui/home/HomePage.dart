import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/ui/content_ui/home/SalonListPage.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:com.urbaevent/model/ResponseNotifications.dart' hide Meta, Pagination;
import 'package:com.urbaevent/utils/QrScannerOverlayShape.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/adapter_view/CurrentEvents.dart';
import 'package:com.urbaevent/adapter_view/MyContact.dart';
import 'package:com.urbaevent/adapter_view/MyEvents.dart';
import 'package:com.urbaevent/dialogs/Progressbar.dart';
import 'package:com.urbaevent/model/ResponseContactDetails.dart';
import 'package:com.urbaevent/model/ResponseContactList.dart' hide Meta, Pagination;
import 'package:com.urbaevent/model/ResponseScanContact.dart';
import 'package:com.urbaevent/model/common/ResponseError.dart';
import 'package:com.urbaevent/model/events/ResponseEbadges.dart' hide Meta, Pagination, Datum;

import 'package:com.urbaevent/model/events/ResponseEvents.dart';
import 'package:com.urbaevent/model/common/ResponseUser.dart';
import 'package:com.urbaevent/model/ResponseAuthRole.dart' as AuthModel;
import 'package:com.urbaevent/model/events/ResponseMyEvents.dart' as Rev2;
import 'package:com.urbaevent/ui/auth/SignIn.dart';
import 'package:com.urbaevent/ui/auth/SignUp.dart';
import 'package:com.urbaevent/ui/content_ui/home/sub_views/EBadgeDetails.dart';
import 'package:com.urbaevent/ui/content_ui/Event/EventDetails.dart';
import 'package:com.urbaevent/ui/content_ui/home/NotificationList.dart';
import 'package:com.urbaevent/ui/content_ui/home/sub_views/Profile.dart';
import 'package:com.urbaevent/ui/content_ui/home/sub_views/FloorPlanViewer.dart';
import 'package:com.urbaevent/ui/content_ui/home/sub_views/ProfileInformation.dart';
import 'package:com.urbaevent/ui/content_ui/shared/WebViewScreen.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:com.urbaevent/utils/PageVisibilityObserver.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CustomBottomBar.dart';
import 'package:com.urbaevent/widgets/CustomToolbar.dart';
import 'package:com.urbaevent/widgets/HalfImageVisible.dart';
import 'package:flutter_svg/svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:just_audio/just_audio.dart';

import 'package:http/http.dart' as http;
import 'package:qr_mobile_vision/qr_camera.dart';
import 'package:vibration/vibration.dart';
import 'package:visibility_detector/visibility_detector.dart';

class HomePage extends StatefulWidget {
  final int setUIMode;

  HomePage(this.setUIMode);

  @override
  State<StatefulWidget> createState() => _HomePage();
}

class _HomePage extends State<HomePage> {
  /// Wrapper safe : exécute setState seulement si le widget est mounted.
  /// Évite les "setState() called after dispose()" sur les callbacks async.
  void _safeSetState(VoidCallback fn) {
    if (mounted) setState(fn);
  }

  bool showSearchView = false;
  bool isLoggedIn = false;
  int uiMode = 0;
  bool loader = false;
  bool _homeDataLoaded = false;
  String scanResult = "";
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  TextEditingController textController = TextEditingController();

  late ResponseEvents responseEvents;
  Rev2.ResponseMyEvents? userResponseEvents;
  List<EventItem> filteredEvents = [];
  ResponseUser? _responseUser;
  ResponseEbadges? responseEbadges; // legacy (non utilisé)
  List<Map<String, dynamic>> _myEbadges = [];
  ResponseScanContact? responseScanContact;
  ResponseContactList? responseContactList;
  List<ContactItem>? contactItemList;
  ResponseContactDetails? responseContactDetails;
  ResponseNotifications? responseNotifications;

  bool getEventsInit = false;
  bool getEventsFailed = false;
  late PageVisibilityObserver _pageVisibilityObserver;
  bool _isVisible = true;
  int ebadgeItemPosition = -1;
  AudioPlayer? audioPlayer;
  bool isInit = false;
  int lastReadIndex = -1;
  String? qr;
  bool camState = true;
  bool dirState = false;
  String _userType = 'visitor'; // visitor, exhibitor, partner, vip, admin

  void handleCallback(int val) {
    setState(() {
      loader = false;

      if (isLoggedIn) {
        if (val == Const.homeUI) {
          showSearchView = false;
        }
        if (val == Const.profileUI) {
          showSearchView = false;
          getUserDetails();
        }
        if (val == Const.myContactsUI) {
          showSearchView = false;
          getContactList();
        }
        if (val == Const.scanUI) {
          scanResult = "";
        }
        uiMode = val;
      } else {
        if (val == Const.homeUI) {
          showSearchView = false;
          getEventList();
          getUserDetails();
          uiMode = val;
        } else {
          Navigator.push(
            context,
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) => SignIn(),
              transitionsBuilder:
                  (context, animation, secondaryAnimation, child) {
                const begin = Offset(1.0, 0.0); // Slide from right
                const end = Offset.zero;
                const curve = Curves.easeInOut;
                var tween = Tween(begin: begin, end: end)
                    .chain(CurveTween(curve: curve));
                var offsetAnimation = animation.drive(tween);
                return SlideTransition(position: offsetAnimation, child: child);
              },
            ),
          );
        }
      }
    });
  }

  void handleEBadgeDetails(int val) {
    setState(() {
      ebadgeItemPosition = val;
      uiMode = Const.eBadgeDetailsUI;
    });
  }

  void handleMyContactDetails(int val) {
    getContactDetails(contactItemList![val].users![0].id!);
  }

  void handleEventDetailsCallback(int val) {
    setState(() {
      bool myEvent = false;
      int confirmed = Const.eventConfirmationPending;
      String type = "visitor";
      type = responseEvents.data[val].type ?? "visitor";
      if (userResponseEvents != null && getEventsInit && isLoggedIn) {
        for (int j = 0; j < userResponseEvents!.data.length; j++) {
          if (responseEvents.data[val].id ==
              userResponseEvents!.data[j].event.id) {
            responseEvents.data[val].registrationType =
                userResponseEvents!.data[j].type;
            Const.registrationId = userResponseEvents!.data[j].id;
            myEvent = true;
            if (userResponseEvents!.data[j].confirmed == null) {
              confirmed = Const.eventConfirmationPending;
            } else if (userResponseEvents!.data[j].confirmed != null &&
                userResponseEvents!.data[j].confirmed!) {
              confirmed = Const.eventConfirmed;
            } else if (userResponseEvents!.data[j].confirmed != null &&
                !userResponseEvents!.data[j].confirmed!) {
              confirmed = Const.eventConfirmationRejected;
            }
            break;
          }
        }
      }
      Navigator.push(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => EventDetails(
              data: responseEvents.data[val],
              isRegisteredForEvent: myEvent,
              confirmed: confirmed,
              type: type),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            const begin = Offset(1.0, 0.0); // Slide from right
            const end = Offset.zero;
            const curve = Curves.easeInOut;
            var tween =
                Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
            var offsetAnimation = animation.drive(tween);
            return SlideTransition(position: offsetAnimation, child: child);
          },
        ),
      );
    });
  }

  void handleMyEventDetailsCallback(int val, int confirmed, String type) {
    if (getEventsInit) {
      String regType = "visitor";
      for (int j = 0; j < userResponseEvents!.data.length; j++) {
        if (val == userResponseEvents!.data[j].event.id) {
          Const.registrationId = userResponseEvents!.data[j].id;
          regType = userResponseEvents!.data[j].type.toString();
        }
      }
      for (int i = 0; i < responseEvents.data.length; i++) {
        if (val == responseEvents.data[i].id) {
          type = responseEvents.data[i].type ?? "visitor";
          responseEvents.data[i].registrationType = regType;

          Navigator.push(
            context,
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) =>
                  EventDetails(
                      data: responseEvents.data[i],
                      isRegisteredForEvent: true,
                      confirmed: confirmed,
                      type: type),
              transitionsBuilder:
                  (context, animation, secondaryAnimation, child) {
                const begin = Offset(1.0, 0.0); // Slide from right
                const end = Offset.zero;
                const curve = Curves.easeInOut;
                var tween = Tween(begin: begin, end: end)
                    .chain(CurveTween(curve: curve));
                var offsetAnimation = animation.drive(tween);
                return SlideTransition(position: offsetAnimation, child: child);
              },
            ),
          );
          break;
        }
      }
    }
  }

  void handleProfileCallbacks(int val) {
    setState(() {
      switch (val) {
        case 0:
          break;

        case 1:
          String stringPicUrl = "";
          if (_responseUser!.avatar == null) {
            stringPicUrl = Urls.imageURL;
          } else {
            stringPicUrl = Urls.imageURL + _responseUser!.avatar!.url;
          }

          Navigator.push(
            context,
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) =>
                  ProfileInformation(
                      title: "",
                      isMine: true,
                      avatar: stringPicUrl,
                      name: _responseUser!.name,
                      company: _responseUser!.company,
                      businessIndustry: _responseUser!.businessSector,
                      email: _responseUser!.email,
                      phoneNumber: _responseUser!.phone,
                      isUser: true),
              transitionsBuilder:
                  (context, animation, secondaryAnimation, child) {
                const begin = Offset(1.0, 0.0); // Slide from right
                const end = Offset.zero;
                const curve = Curves.easeInOut;
                var tween = Tween(begin: begin, end: end)
                    .chain(CurveTween(curve: curve));
                var offsetAnimation = animation.drive(tween);
                return SlideTransition(position: offsetAnimation, child: child);
              },
            ),
          );
          break;

        case 3:
          _showLogoutDialog(context);
          break;
      }
    });
  }

  void onBackCallBack() {
    setState(() {
      onBackOptions();
    });
  }

  void onBackOptions() {
    if (uiMode == Const.eBadgeDetailsUI) {
      uiMode = Const.eBadgesUI;
    } else if (uiMode == Const.contactDetailsUI) {
      uiMode = Const.myContactsUI;
    } else if (uiMode == Const.contactDetailsUI) {
      uiMode = Const.eBadgesUI;
      getEbadgesList();
    } else {
      uiMode = Const.homeUI;
      getEventList();
    }
  }

  Future<void> clearAppPreferences() async {
    Preference preference = await Preference.getInstance();
    preference.clearAppPreferences();
  }

  Future<void> getEventList() async {
    setState(() {
      loader = true;
    });
    try {
      final salons = await SupabaseService.instance.getSalons();
      final now = DateTime.now();
      final items = salons.asMap().entries.map((e) {
        final s = e.value;
        return EventItem(
          id: e.key + 1,
          name: s['name'] ?? '',
          organizer: 'SIB',
          description: s['description'],
          fullDescription: s['description'] ?? '',
          startDate: s['date_debut'] != null ? DateTime.parse(s['date_debut']) : now,
          endDate: s['date_fin'] != null ? DateTime.parse(s['date_fin']) : now,
          locationAddress: s['location'] ?? '',
          locationLatLng: '',
          presentationUrl: s['cover_url'] as String?,
          createdAt: s['created_at'] != null ? DateTime.parse(s['created_at']) : now,
          updatedAt: s['updated_at'] != null ? DateTime.parse(s['updated_at']) : now,
        );
      }).toList();
      responseEvents = ResponseEvents(
        data: items,
        meta: Meta(pagination: Pagination(page: 1, pageSize: items.length, pageCount: 1, total: items.length)),
      );
      filteredEvents = List.from(items);
      getEventsInit = true;
    } catch (e) {
      debugPrint('Error loading salons: $e');
      getEventsFailed = true;
    }
    setState(() {
      loader = false;
    });
    getUserDetails();
  }

  void filterItems(String query) {
    setState(() {
      // If the query is empty, display the initial list
      if (query.isEmpty) {
        filteredEvents.clear();
        filteredEvents.addAll(responseEvents.data);
      } else {
        // Otherwise, filter the items based on the query
        filteredEvents = responseEvents.data
            .where(
                (item) => item.name.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  Future<void> _showLogoutDialog(BuildContext context) async {
    return showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          title: Text(
            Intl.message("logout", name: "logout"),
            style: GoogleFonts.roboto(
                color: Colors.black,
                fontStyle: FontStyle.normal,
                fontSize: 16,
                fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          content: Text(Intl.message("logout_msg", name: "logout_msg"),
              style: GoogleFonts.roboto(
                  color: Colors.black,
                  fontStyle: FontStyle.normal,
                  fontSize: 16,
                  fontWeight: FontWeight.w400),
              textAlign: TextAlign.center),
          actions: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextButton(
                  onPressed: () async {
                    Navigator.of(context).pop();
                  },
                  child: Text(
                    Intl.message("cancel", name: "cancel"),
                    style: GoogleFonts.roboto(
                        color: Colors.white,
                        fontStyle: FontStyle.normal,
                        fontSize: 12,
                        fontWeight: FontWeight.w400),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color.fromRGBO(217, 217, 217, 1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30.0),
                    ),
                  ),
                ),
                SizedBox(
                  width: 25,
                ),
                TextButton(
                  onPressed: () async {
                    Navigator.of(context).pop();
                    setState(() {
                      clearAppPreferences();
                      uiMode = Const.homeUI;
                      isLoggedIn = false;
                    });
                  },
                  child: Text(
                    Intl.message("yes", name: "yes"),
                    style: GoogleFonts.roboto(
                        color: Colors.white,
                        fontStyle: FontStyle.normal,
                        fontSize: 12,
                        fontWeight: FontWeight.w400),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ThemeColor.themeOrange,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30.0),
                    ),
                  ),
                ),
              ],
            )
          ],
        );
      },
    );
  }

  Future<void> vibrateOnce() async {
    final available = await Vibration.hasVibrator();
    if (available == true) {
      Vibration.vibrate(duration: 500);
    }
  }

  Future<void> getAuthRole() async {
    // Auth role is now handled via Supabase user profile type field
    // No-op: role derived from getUserDetails()
  }

  Future<void> getNotifications() async {
    Preference preference = await Preference.getInstance();

    final uuid = preference.getUserUUID();

    if (uuid.isNotEmpty) {
      if (preference.getAuthRole() != null &&
          preference.getAuthRole()!.lastNotificationIndex != null) {
        lastReadIndex = preference.getAuthRole()!.lastNotificationIndex!;
        print('Last Read Index: $lastReadIndex');
      }

      try {
        final notifications = await SupabaseService.instance.getNotifications();
        setState(() {
          loader = false;
          // Build a minimal ResponseNotifications from the list
          responseNotifications = ResponseNotifications(
            data: notifications.map((n) {
              return Datum(
                id: n['id'] is int ? n['id'] : 0,
                text: n['text'] ?? '',
                createdAt: n['created_at'] != null ? DateTime.tryParse(n['created_at']) : null,
                updatedAt: n['updated_at'] != null ? DateTime.tryParse(n['updated_at']) : null,
              );
            }).toList(),
          );
          int unreadCount = 0;
          if (lastReadIndex > 0 && responseNotifications!.data != null) {
            unreadCount = responseNotifications!.data!.length - lastReadIndex;
          }
          if (unreadCount > 0) {
            Utils.notificationCount = unreadCount;
          } else {
            Utils.notificationCount = 0;
          }
        });
      } catch (e) {
        setState(() {
          loader = false;
        });
        debugPrint('getNotifications error: $e');
      }
    } else {
      setState(() {
        loader = false;
      });
    }
  }

  Future<void> getUserDetails() async {
    Preference preference = await Preference.getInstance();
    if (!mounted) return;
    final uuid = preference.getUserUUID();
    if (uuid.isEmpty) {
      _safeSetState(() { isLoggedIn = false; });
      _safeSetState(() { getAuthRole(); isInit = true; });
      return;
    }
    _safeSetState(() { isLoggedIn = true; });
    try {
      // Save FCM token to Supabase (safe)
      try {
        FirebaseMessaging messaging = FirebaseMessaging.instance;
        String? fcmToken = await messaging.getToken();
        if (fcmToken != null) {
          final os = Platform.isAndroid ? 'android' : 'ios';
          await SupabaseService.instance.savePushToken(fcmToken, os);
        }
      } catch (fcmError) {
        debugPrint('FCM Token skipped due to error: $fcmError');
      }

      // Fetch profile from Supabase
      final profile = await SupabaseService.instance.getUserProfile(uuid);
      if (!mounted) return;
      if (profile != null) {
        setState(() {
          _userType = (profile['type'] as String?) ?? 'visitor';
          final now = DateTime.now();
          _responseUser = ResponseUser(
            id: 1,
            username: profile['email'] ?? '',
            email: profile['email'] ?? '',
            confirmed: true,
            blocked: false,
            name: profile['name'] ?? '',
            phone: profile['phone'],
            company: profile['company'],
            emailOTPConfirmed: true,
            role: Role(
              id: 1,
              name: _userType,
              description: _userType,
              type: _userType,
              createdAt: now,
              updatedAt: now,
            ),
          );
        });
        // Save ResponseAuthRole so Profile.checkRoleAndLanguage works
        final authRole = AuthModel.ResponseAuthRole(
          id: 1,
          username: profile['email'] ?? '',
          email: profile['email'] ?? '',
          name: profile['name'] ?? '',
          phone: profile['phone'],
          company: profile['company'],
          confirmed: true,
          blocked: false,
          emailOTPConfirmed: true,
          role: AuthModel.Role(id: 1, name: _userType, type: _userType),
        );
        await preference.saveAuthRole(authRole);
      } else {
        _safeSetState(() { isLoggedIn = false; });
      }
    } catch (e) {
      debugPrint('getUserDetails error: $e');
      if (mounted) {
        Utils.showToast('Impossible de charger votre profil.');
      }
      _safeSetState(() { isLoggedIn = false; });
    }
    _safeSetState(() {
      getAuthRole();
      isInit = true;
    });
    if (_responseUser != null) {
      if (_responseUser!.emailOTPConfirmed == true) {
        getUserEventList();
        getEbadgesList();
      } else {
        clearAppPreferences();
        setState(() {
          uiMode = Const.homeUI;
          isLoggedIn = false;
        });
      }
    }
  }

  Future<void> getContactList() async {
    try {
      await SupabaseService.instance.getScannedContacts();
      _safeSetState(() {
        contactItemList = [];
      });
    } catch (e) {
      debugPrint('getContactList error: $e');
      if (mounted) {
        Utils.showToast('Impossible de charger les contacts.');
      }
    }
  }

  Future<void> getUserEventList() async {
    _safeSetState(() { loader = true; });
    try {
      await SupabaseService.instance.getUserRegistrations();
      // registrations are available; rendering handled via userResponseEvents
      // For now we set an empty response to avoid null errors
      userResponseEvents = Rev2.ResponseMyEvents(
        data: [],
        meta: Rev2.Meta(pagination: Rev2.Pagination(page: 1, pageSize: 0, pageCount: 0, total: 0)),
      );
    } catch (e) {
      debugPrint('getUserEventList error: $e');
    }
    _safeSetState(() { loader = false; });
  }

  Future<void> addUserToContact(List<String> strResult) async {
    _safeSetState(() { loader = true; });
    try {
      await SupabaseService.instance.saveScan(
        scannedUserId: strResult[0],
        salonId: strResult.length > 1 ? strResult[1] : null,
      );
      if (!mounted) return;
      Utils.showToast(Intl.message("contact_added_successfully",
          name: "contact_added_successfully"));
      _safeSetState(() {
        uiMode = Const.myContactsUI;
        getContactList();
      });
    } catch (e) {
      Utils.showToast(e.toString());
      Timer(Duration(seconds: 3), () { scanResult = ""; });
    }
    _safeSetState(() { loader = false; });
  }

  Future<void> getContactDetails(int userID) async {
    setState(() {
      loader = true;
    });

    try {
      final profile = await SupabaseService.instance
          .getContactDetails(userID.toString());

      if (!mounted) return;
      if (profile != null) {
        setState(() {
          String stringPicUrl = profile['avatar_url'] ?? '';

          Navigator.push(
            context,
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) =>
                  ProfileInformation(
                      title: "",
                      isMine: false,
                      avatar: stringPicUrl,
                      name: profile['name'] ?? " ",
                      company: profile['company'] ?? " ",
                      businessIndustry:
                          profile['business_sector'] ?? " ",
                      email: profile['email'] ?? " ",
                      phoneNumber: profile['phone'] ?? " ",
                      isUser: true),
              transitionsBuilder:
                  (context, animation, secondaryAnimation, child) {
                const begin = Offset(1.0, 0.0);
                const end = Offset.zero;
                const curve = Curves.easeInOut;
                var tween = Tween(begin: begin, end: end)
                    .chain(CurveTween(curve: curve));
                var offsetAnimation = animation.drive(tween);
                return SlideTransition(position: offsetAnimation, child: child);
              },
            ),
          );
        });
      }
    } catch (e) {
      debugPrint('getContactDetails error: $e');
    }

    _safeSetState(() {
      loader = false;
    });
  }

  Future<void> getUIStates() async {
    Preference preference = await Preference.getInstance();
    if (preference.getToken().isNotEmpty) {
      uiMode = widget.setUIMode;
    } else {
      if (widget.setUIMode == 0) {
        uiMode = widget.setUIMode;
      } else {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => SignIn()),
        );
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _pageVisibilityObserver =
        PageVisibilityObserver(_handlePageVisibilityChange);
    WidgetsBinding.instance.addObserver(_pageVisibilityObserver);
    getUIStates();
    getEventList();
  }

  /// Charge les e-badges de l'utilisateur depuis Supabase.
  Future<void> getEbadgesList() async {
    if (!isLoggedIn) return;
    try {
      final badges = await SupabaseService.instance.getMyEbadges();
      if (!mounted) return;
      // Si aucun badge et salon actif dispo → créer automatiquement l'inscription
      if (badges.isEmpty) {
        final salonId = ActiveSalon.current?['id'] as String?;
        if (salonId != null) {
          final reg = await SupabaseService.instance.registerForSalon(
            salonId: salonId,
            type: _userType,
          );
          _safeSetState(() { _myEbadges = [reg]; });
        } else {
          _safeSetState(() { _myEbadges = []; });
        }
      } else {
        _safeSetState(() { _myEbadges = badges; });
      }
    } catch (e) {
      debugPrint('getEbadgesList error: $e');
    }
    getContactList();
  }

  void _handlePageVisibilityChange(bool isVisible) {
    setState(() {
      _isVisible = isVisible;
      if (_isVisible) {
        print('onResume');
      } else {
        print('onPause');
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(_pageVisibilityObserver);
    super.dispose();
  }

  double _calculateListViewHeight(int itemCount) {
    const listItemHeight = 105.0 + 50;
    const listPadding = 16.0;
    return itemCount * (listItemHeight + listPadding);
  }

  // ──────────── Helpers HomePage ────────────

  void _openWebView(String title, String path) {
    final base = ActiveSalon.webUrl ?? 'https://sib2026.vercel.app';
    String url = '$base$path';
    final session = SupabaseService.instance.supabaseClient.auth.currentSession;
    final token = session?.accessToken;
    final refresh = session?.refreshToken;
    
    if (token != null && refresh != null) {
      url += '#access_token=$token&refresh_token=$refresh&expires_in=3600&token_type=bearer&type=recovery';
    }
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => WebViewScreen(title: title, url: url, accessToken: token),
      ),
    );
  }

  Widget _buildSalonHero() {
    final coverUrl = ActiveSalon.coverUrl;
    final salonName = ActiveSalon.name;
    final location = ActiveSalon.location ?? '';
    final dateDebut = ActiveSalon.dateDebut;
    final dateFin = ActiveSalon.dateFin;
    String dateBadge = '';
    if (dateDebut != null && dateFin != null) {
      final fmt = DateFormat('dd MMM', 'fr');
      dateBadge = '${fmt.format(dateDebut)} – ${DateFormat('dd MMM yyyy', 'fr').format(dateFin)}';
    }
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: Stack(
        children: [
          // Image de couverture
          Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFF0D2137),
              image: coverUrl != null
                  ? DecorationImage(image: NetworkImage(coverUrl), fit: BoxFit.cover, colorFilter: ColorFilter.mode(Colors.black.withValues(alpha: 0.45), BlendMode.darken))
                  : null,
            ),
          ),
          // Gradient en bas
          Positioned(
            left: 0, right: 0, bottom: 0,
            child: Container(
              height: 100,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Color(0xCC0D2137)],
                ),
              ),
            ),
          ),
          // Badge date
          if (dateBadge.isNotEmpty)
            Positioned(
              top: 12, right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFF4598D1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(dateBadge, style: GoogleFonts.roboto(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ),
          // Nom + location
          Positioned(
            left: 16, bottom: 12, right: 16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(salonName, style: GoogleFonts.roboto(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                if (location.isNotEmpty)
                  Row(children: [
                    const Icon(Icons.location_on, color: Color(0xFF4598D1), size: 14),
                    const SizedBox(width: 3),
                    Text(location, style: GoogleFonts.roboto(color: Colors.white70, fontSize: 12)),
                  ]),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAccess() {
    final accent = const Color(0xFF4598D1);
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(Intl.message('quickAccess', name: 'quickAccess', desc: 'Accès rapide'),
              style: GoogleFonts.roboto(color: const Color(0xFF0D2137), fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _QuickBtn(icon: Icons.store_outlined, label: 'Exposants', color: accent, onTap: () => _openWebView('Exposants', '/exhibitors'))),
              const SizedBox(width: 10),
              Expanded(child: _QuickBtn(icon: Icons.handshake_outlined, label: 'Partenaires', color: const Color(0xFF16A34A), onTap: () => _openWebView('Partenaires', '/partners'))),
              const SizedBox(width: 10),
              Expanded(child: _QuickBtn(icon: Icons.event_outlined, label: 'Programme', color: const Color(0xFFF97316), onTap: () => _openWebView('Programme', '/events'))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMediaSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Médias', style: GoogleFonts.roboto(color: const Color(0xFF0D2137), fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _QuickBtn(icon: Icons.videocam_outlined, label: 'Webinaires', color: const Color(0xFF7C3AED), onTap: () => _openWebView('Webinaires', '/media/webinars'))),
              const SizedBox(width: 10),
              Expanded(child: _QuickBtn(icon: Icons.headphones_outlined, label: 'Podcasts', color: const Color(0xFFDC2626), onTap: () => _openWebView('Podcasts', '/media/podcasts'))),
              const SizedBox(width: 10),
              Expanded(child: _QuickBtn(icon: Icons.live_tv_outlined, label: 'Live Studio', color: const Color(0xFF4598D1), onTap: () => _openWebView('Live Studio', '/media/live-studio'))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFloorPlanSection() {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => FloorPlanViewer(
              salonName: ActiveSalon.name,
              salonColor: const Color(0xFF4598D1),
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE8ECF0)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 6, offset: const Offset(0, 2))],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF4598D1).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.map_outlined, color: Color(0xFF4598D1), size: 26),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Plan du Salon', style: GoogleFonts.roboto(color: const Color(0xFF0D2137), fontSize: 15, fontWeight: FontWeight.w700)),
                  Text('Halls, stands & pavillons', style: GoogleFonts.roboto(color: const Color(0xFF64748B), fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, color: Color(0xFFB0B8C1), size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildNetworkingSection() {
    return GestureDetector(
      onTap: () => _openWebView('Réseautage', '/networking'),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF0D2137), Color(0xFF4598D1)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [BoxShadow(color: const Color(0xFF4598D1).withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))],
        ),
        child: Row(
          children: [
            const Icon(Icons.people_alt_outlined, color: Colors.white, size: 28),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Matching & Réseautage', style: GoogleFonts.roboto(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                  Text('Rencontrez vos partenaires idéaux', style: GoogleFonts.roboto(color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, color: Colors.white54, size: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SIB',
      debugShowCheckedModeBanner: false,
      home: _buildHomeContent(),
    );
  }

  Widget _buildHomeContent() {
    Future<bool> _onBackPressedOveRiding() async {
      if (uiMode == Const.homeUI) {
        return true;
      } else {
        setState(() {
          onBackOptions();
        });
      }
      return false;
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, _) {
        if (!didPop) _onBackPressedOveRiding();
      },
      child: Scaffold(
          resizeToAvoidBottomInset: false,
          body: VisibilityDetector(
            key: Key("homePage"),
            onVisibilityChanged: (VisibilityInfo info) {
              // Data loaded via initState — no extra reload needed
            },
            child: Stack(
              children: [
                Container(color: ThemeColor.bgColor),
                if (uiMode == Const.homeUI || uiMode == Const.searchEventUI)
                  HalfImageVisible(),
                Column(

                  children: [
                    //Toolbar
                    if (uiMode == Const.homeUI || uiMode == Const.searchEventUI)
                      SizedBox(
                        height: 22,
                      ),
                    if (uiMode == Const.searchEventUI && isLoggedIn)
                      SizedBox(
                        height: 18,
                      ),
                    if (uiMode == Const.searchEventUI && !isLoggedIn)
                      SizedBox(
                        height: 30,
                      ),
                    if (uiMode == Const.homeUI || uiMode == Const.searchEventUI)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 16,
                          ),
                          if (!showSearchView)
                            Expanded(
                                flex: 1,
                                child: GestureDetector(
                                  onTap: () {
                                    Navigator.pushAndRemoveUntil(
                                      context,
                                      MaterialPageRoute(builder: (_) => SalonListPage()),
                                      (route) => false,
                                    );
                                  },
                                  child: Container(
                                    alignment: Alignment.centerLeft,
                                    child: Row(
                                      children: [
                                        Icon(Icons.arrow_back_ios, size: 18, color: ThemeColor.textPrimary),
                                        SizedBox(width: 4),
                                        if (ActiveSalon.logoUrl != null && ActiveSalon.logoUrl!.isNotEmpty)
                                          CachedNetworkImage(
                                            imageUrl: ActiveSalon.logoUrl!,
                                            width: 100,
                                            height: 50,
                                            fit: BoxFit.contain,
                                            errorWidget: (_, __, ___) => Text(
                                              ActiveSalon.name,
                                              style: GoogleFonts.roboto(fontSize: 18, fontWeight: FontWeight.w700, color: ThemeColor.textPrimary),
                                            ),
                                          )
                                        else
                                          Text(
                                            ActiveSalon.name,
                                            style: GoogleFonts.roboto(fontSize: 18, fontWeight: FontWeight.w700, color: ThemeColor.textPrimary),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                      ],
                                    ),
                                  ),
                                )),
                          Align(
                            alignment: Alignment.centerRight,
                            // Align the image to the right
                            child: Container(
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  if (!isLoggedIn && !showSearchView)
                                    SizedBox(
                                      width: 40,
                                    ),
                                  if (!showSearchView)
                                    IconButton(
                                      iconSize: 50,
                                      icon: SvgPicture.asset(
                                        'assets/ic_search.svg',
                                        width: 40,
                                        height: 40,
                                        fit: BoxFit.fitHeight,
                                      ),
                                      // Replace with your image asset path
                                      onPressed: () {
                                        setState(() {
                                          setState(() {
                                            showSearchView = true;
                                            uiMode = Const.searchEventUI;
                                          });
                                        });
                                      },
                                    ),
                                  if (showSearchView)
                                    LayoutBuilder(builder:
                                        (BuildContext context,
                                            BoxConstraints constraints) {
                                      int widthDifference = 0;

                                      if (isLoggedIn) {
                                        widthDifference = 82;
                                      } else {
                                        widthDifference = 40;
                                      }

                                      return Container(
                                        height: 40,
                                        width:
                                            MediaQuery.of(context).size.width -
                                                widthDifference,
                                        decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.all(
                                              Radius.circular(30.0),
                                            )),
                                        child: Stack(
                                          children: [
                                            Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                IconButton(
                                                  iconSize: 20,
                                                  icon: SvgPicture.asset(
                                                    'assets/ic_search_clear.svg',
                                                    width: 20,
                                                    height: 20,
                                                  ),
                                                  // Replace with your image asset path
                                                  onPressed: () {
                                                    textController.clear();
                                                    filterItems('');
                                                  },
                                                ),
                                                Expanded(
                                                  child: Center(
                                                    child: TextField(
                                                      controller:
                                                          textController,
                                                      onChanged: filterItems,
                                                      decoration:
                                                          InputDecoration(
                                                        hintText: Intl.message(
                                                            "search",
                                                            name: "search"),
                                                        hintStyle: TextStyle(
                                                            color:
                                                                Color.fromRGBO(
                                                                    132,
                                                                    130,
                                                                    130,
                                                                    1)),
                                                        border:
                                                            InputBorder.none,
                                                      ),
                                                      style: GoogleFonts.roboto(
                                                          fontSize: 18.0,
                                                          fontWeight:
                                                              FontWeight.w400,
                                                          color: Color.fromRGBO(
                                                              0, 0, 0, 1.0)),
                                                    ),
                                                  ),
                                                ),
                                                IconButton(
                                                  iconSize: 30,
                                                  icon: SvgPicture.asset(
                                                    'assets/ic_close_clear_.svg',
                                                    width: 30,
                                                    height: 30,
                                                  ),
                                                  // Replace with your image asset path
                                                  onPressed: () {
                                                    setState(() {
                                                      showSearchView = false;
                                                      uiMode = Const.homeUI;
                                                    });
                                                  },
                                                )
                                              ],
                                            )
                                          ],
                                        ),
                                      );
                                    }),
                                  if (isLoggedIn)
                                    if (Utils.notificationCount != -1)
                                      IconButton(
                                        iconSize: 40,
                                        icon: Stack(
                                          alignment: Alignment.center,
                                          children: [
                                            Container(
                                              width: 40.0,
                                              // Adjust the size as needed
                                              height: 40.0,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: Colors.white,
                                              ),
                                            ),
                                            SvgPicture.asset(
                                              'assets/ic_noti.svg',
                                              width: 20,
                                              height: 20,
                                              fit: BoxFit.cover,
                                            ),
                                            if (Utils.notificationCount > 0)
                                              Positioned(
                                                top: 4.0,
                                                // Adjust the top and right values as needed
                                                right: 6.0,
                                                child: Container(
                                                  alignment: Alignment.center,
                                                  // Adjust the width and height as needed
                                                  height: 18.0,
                                                  decoration: BoxDecoration(
                                                    shape: BoxShape.circle,
                                                    color:
                                                        ThemeColor.colorAccent,
                                                  ),
                                                  child: Center(
                                                    child: Padding(
                                                      padding:
                                                          const EdgeInsets.all(
                                                              4.0),
                                                      child: Text(
                                                        Utils.notificationCount
                                                            .toString(),
                                                        // Text inside the badge
                                                        style: TextStyle(
                                                          fontSize: 10,
                                                          color: Colors.white,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                          ],
                                        ),
                                        // Replace with your image asset path
                                        onPressed: () {
                                          setState(() {
                                            Navigator.push(
                                              context,
                                              PageRouteBuilder(
                                                pageBuilder: (context,
                                                        animation,
                                                        secondaryAnimation) =>
                                                    NotificationList(),
                                                transitionsBuilder: (context,
                                                    animation,
                                                    secondaryAnimation,
                                                    child) {
                                                  const begin = Offset(1.0,
                                                      0.0); // Slide from right
                                                  const end = Offset.zero;
                                                  const curve =
                                                      Curves.easeInOut;
                                                  var tween = Tween(
                                                          begin: begin,
                                                          end: end)
                                                      .chain(CurveTween(
                                                          curve: curve));
                                                  var offsetAnimation =
                                                      animation.drive(tween);
                                                  return SlideTransition(
                                                      position: offsetAnimation,
                                                      child: child);
                                                },
                                              ),
                                            );
                                          });
                                        },
                                      )
                                ],
                              ),
                            ),
                          ),
                          SizedBox(
                            width: 10,
                          ),
                        ],
                      ),
                    if (uiMode == Const.searchEventUI)
                      SizedBox(
                        height: 20,
                      ),
                    if (uiMode == Const.myContactsUI)
                      CustomToolbar(
                          Intl.message("my_contacts", name: "my_contacts"),
                          onBackCallBack,
                          Utils.notificationCount,
                          false),
                    if (uiMode == Const.scanUI)
                      Container(
                        alignment: Alignment.center,
                        height: 130,
                        child: Center(
                          child: Padding(
                            padding: const EdgeInsets.only(
                                left: 30.0, right: 30, bottom: 20, top: 40),
                            child: Text(
                              Intl.message("header_scan", name: "header_scan"),
                              textAlign: TextAlign.center,
                              style: GoogleFonts.roboto(
                                  color: ThemeColor.textPrimary,
                                  fontStyle: FontStyle.normal,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w400),
                            ),
                          ),
                        ),
                      ),
                    if (uiMode == Const.eBadgesUI)
                      CustomToolbar(Intl.message("ebadges", name: "ebadges"),
                          onBackCallBack, Utils.notificationCount, false),
                    if (uiMode == Const.profileUI)
                      CustomToolbar(Intl.message("profile", name: "profile"),
                          onBackCallBack, Utils.notificationCount, false),
                    if (uiMode == Const.eBadgeDetailsUI)
                      CustomToolbar(
                          Intl.message("ebadge_details",
                              name: "ebadge_details"),
                          onBackCallBack,
                          Utils.notificationCount,
                          false),
                    if (uiMode == Const.contactDetailsUI)
                      CustomToolbar(
                          Intl.message("contact_details",
                              name: "contact_details"),
                          onBackCallBack,
                          Utils.notificationCount,
                          false),

                    // Middle Section
                    if (uiMode == Const.homeUI)
                      Expanded(
                        flex: 1,
                        child: SingleChildScrollView(
                          padding: EdgeInsets.zero,
                          child: Column(
                            children: [
                              // ── Hero image + description ──
                              _buildSalonHero(),
                              // ── Accès rapide : Exposants / Partenaires / Programme ──
                              _buildQuickAccess(),
                              // ── Médias : Webinaires / Podcasts / Live Studio ──
                              _buildMediaSection(),
                              // ── Plan du salon ──
                              _buildFloorPlanSection(),
                              // ── Réseautage (uniquement si connecté) ──
                              if (isLoggedIn)
                                _buildNetworkingSection(),
                              const SizedBox(height: 16),
                              // ── Mes événements ──
                              Container(
                                padding: const EdgeInsets.only(
                                    left: 20, right: 20, top: 4, bottom: 8),
                                alignment: Alignment.centerLeft,
                                child: Text(
                                    Intl.message("myEvents", name: "myEvents"),
                                    style: GoogleFonts.roboto(
                                        color: const Color(0xFF0D2137),
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700)),
                              ),
                              if (!isLoggedIn && isInit)
                                Container(
                                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: const Color(0xFFE8ECF0)),
                                  ),
                                  child: Column(
                                    children: [
                                      Text(
                                          Intl.message("accessEventMessage", name: "accessEventMessage"),
                                          textAlign: TextAlign.center,
                                          style: GoogleFonts.roboto(color: const Color(0xFF647483), fontSize: 14)),
                                      const SizedBox(height: 12),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(Intl.message("please", name: "please"),
                                              style: GoogleFonts.roboto(fontSize: 14, color: const Color(0xFF333333), fontWeight: FontWeight.w600)),
                                          TextButton(
                                              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SignUp())),
                                              child: Text(Intl.message("signup", name: "signup"),
                                                  style: GoogleFonts.roboto(color: ThemeColor.colorAccent, fontSize: 14, fontWeight: FontWeight.w700))),
                                          Text(Intl.message("or", name: "or"),
                                              style: GoogleFonts.roboto(fontSize: 14, color: const Color(0xFF333333), fontWeight: FontWeight.w600)),
                                          TextButton(
                                              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SignIn())),
                                              child: Text(Intl.message("login", name: "login"),
                                                  style: GoogleFonts.roboto(color: ThemeColor.colorAccent, fontSize: 14, fontWeight: FontWeight.w700))),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              if (isLoggedIn && userResponseEvents != null)
                                if (userResponseEvents!.data.isNotEmpty)
                                  Container(
                                    height: _calculateListViewHeight(userResponseEvents!.data.length),
                                    child: ListView.builder(
                                      padding: EdgeInsets.all(0),
                                      shrinkWrap: true,
                                      physics: const NeverScrollableScrollPhysics(),
                                      scrollDirection: Axis.vertical,
                                      itemCount: userResponseEvents!.data.length,
                                      itemBuilder: (context, index) {
                                        return MyEvents(userResponseEvents!.data[index], index, handleMyEventDetailsCallback);
                                      },
                                    ),
                                  ),
                              if (isLoggedIn) const SizedBox(height: 40),
                              if (userResponseEvents != null && userResponseEvents!.data.isEmpty) const SizedBox(height: 20),
                              if (userResponseEvents != null && userResponseEvents!.data.isEmpty && isLoggedIn)
                                Text(Intl.message("msg_no_events", name: "msg_no_events"),
                                    style: GoogleFonts.roboto(color: Colors.black, fontSize: 14, fontWeight: FontWeight.w400)),
                            ],
                          ),
                        ),
                      ),
                    if (uiMode == Const.myContactsUI &&
                        responseContactList != null &&
                        responseContactList!.data!.length > 0)
                      Expanded(
                        flex: 1,
                        child: Container(
                          height: MediaQuery.of(context).size.height - 170,
                          child: ListView.builder(
                            padding: EdgeInsets.zero,
                            scrollDirection: Axis.vertical,
                            itemCount: contactItemList!.length,
                            itemBuilder: (context, index) {
                              return MyContact(index, contactItemList![index],
                                  handleMyContactDetails);
                            },
                            // reverse: true,
                            physics: BouncingScrollPhysics(),
                          ),
                        ),
                      ),
                    if (uiMode == Const.myContactsUI &&
                        responseContactList != null &&
                        responseContactList!.data!.length == 0)
                      Expanded(
                        flex: 1,
                        child: Column(
                          children: [
                            SizedBox(
                              height: 40,
                            ),
                            Stack(alignment: Alignment.center, children: [
                              SvgPicture.asset('assets/ic_no_contact.svg'),
                              SvgPicture.asset(
                                'assets/ic_users.svg',
                                height: 100,
                                width: 100,
                              ),
                            ]),
                            SizedBox(
                              height: 40,
                            ),
                            Container(
                              height: 160,
                              width: double.infinity,
                              margin:
                                  new EdgeInsets.symmetric(horizontal: 20.0),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20.0),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: <Widget>[
                                      Text(
                                        Intl.message("add_new_contacts",
                                            name: "add_new_contacts"),
                                        textAlign: TextAlign.center,
                                        style: GoogleFonts.roboto(
                                            fontSize: 20,
                                            decoration: TextDecoration.none,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black),
                                      ),
                                      SizedBox(
                                        height: 20,
                                      ),
                                      Text(
                                        Intl.message("header_scan",
                                            name: "header_scan"),
                                        textAlign: TextAlign.center,
                                        style: GoogleFonts.roboto(
                                            fontSize: 15,
                                            height: 2,
                                            decoration: TextDecoration.none,
                                            fontWeight: FontWeight.w400,
                                            color: Colors.black),
                                      ),
                                    ]),
                              ),
                            ),
                            SizedBox(
                              height: 40,
                            ),
                            Center(
                                child: TextButton(
                              style: TextButton.styleFrom(
                                fixedSize: Size(230, 50),
                                backgroundColor:
                                    Color.fromRGBO(69, 152, 209, 1),
                                // Set the background color to black
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(
                                      25.0), // Set the border radius
                                ),
                              ),
                              onPressed: () async {
                                setState(() {
                                  uiMode = Const.scanUI;
                                });
                              },
                              child: SvgPicture.asset('assets/ic_camera.svg'),
                            ))
                          ],
                        ),
                      ),
                    if (uiMode == Const.myContactsUI &&
                        responseContactList == null)
                      Expanded(
                        flex: 1,
                        child: Column(
                          children: [
                            SizedBox(
                              height: 40,
                            ),
                            SizedBox(
                              width: 160,
                              height: 160,
                              child:
                                  Stack(alignment: Alignment.center, children: [
                                SvgPicture.asset('assets/ic_no_contact.svg'),
                                SvgPicture.asset(
                                  'assets/ic_users.svg',
                                  height: 75,
                                  width: 75,
                                ),
                              ]),
                            ),
                            SizedBox(
                              height: 30,
                            ),
                            Container(
                              height: 175,
                              width: double.infinity,
                              margin:
                                  new EdgeInsets.symmetric(horizontal: 20.0),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20.0),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: <Widget>[
                                      Text(
                                        Intl.message("add_new_contacts",
                                            name: "add_new_contacts"),
                                        textAlign: TextAlign.center,
                                        style: GoogleFonts.roboto(
                                            fontSize: 20,
                                            decoration: TextDecoration.none,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black),
                                      ),
                                      SizedBox(
                                        height: 20,
                                      ),
                                      Text(
                                        Intl.message("header_scan",
                                            name: "header_scan"),
                                        textAlign: TextAlign.center,
                                        style: GoogleFonts.roboto(
                                            fontSize: 15,
                                            height: 2,
                                            decoration: TextDecoration.none,
                                            fontWeight: FontWeight.w400,
                                            color: Colors.black),
                                      ),
                                    ]),
                              ),
                            ),
                            SizedBox(
                              height: 30,
                            ),
                            Center(
                                child: TextButton(
                              style: TextButton.styleFrom(
                                fixedSize: Size(230, 50),
                                backgroundColor:
                                    Color.fromRGBO(69, 152, 209, 1),
                                // Set the background color to black
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(
                                      25.0), // Set the border radius
                                ),
                              ),
                              onPressed: () async {
                                setState(() {
                                  uiMode = Const.scanUI;
                                });
                              },
                              child: SvgPicture.asset('assets/ic_camera.svg'),
                            ))
                          ],
                        ),
                      ),
                    if (uiMode == Const.scanUI)
                      Expanded(flex: 4, child: _scanner()),
                    // ── E-Badges (données Supabase) ──
                    if (uiMode == Const.eBadgesUI && _myEbadges.isNotEmpty)
                      Expanded(
                        flex: 1,
                        child: ListView.builder(
                          padding: EdgeInsets.zero,
                          scrollDirection: Axis.vertical,
                          itemCount: _myEbadges.length,
                          itemBuilder: (context, index) {
                            final reg = _myEbadges[index];
                            final salon = reg['salon'] as Map<String, dynamic>?;
                            final salonName = salon?['name'] as String? ?? 'SIB 2026';
                            final confirmed = reg['confirmed'] as bool?;
                            final type = reg['type'] as String? ?? 'visitor';
                            return GestureDetector(
                              onTap: () => setState(() {
                                ebadgeItemPosition = index;
                                uiMode = Const.eBadgeDetailsUI;
                              }),
                              child: Container(
                                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2))],
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.badge_outlined, size: 36, color: Color(0xFF4598D1)),
                                    const SizedBox(width: 12),
                                    Expanded(child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(salonName, style: GoogleFonts.roboto(fontSize: 15, fontWeight: FontWeight.w700)),
                                        Text(type.toUpperCase(), style: GoogleFonts.roboto(fontSize: 12, color: const Color(0xFF4598D1))),
                                      ],
                                    )),
                                    Icon(
                                      confirmed == true ? Icons.check_circle : confirmed == false ? Icons.cancel : Icons.hourglass_empty,
                                      color: confirmed == true ? Colors.green : confirmed == false ? Colors.red : Colors.orange,
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                          physics: const BouncingScrollPhysics(),
                        ),
                      ),
                    if (uiMode == Const.eBadgesUI && _myEbadges.isEmpty)
                      Expanded(
                        flex: 1,
                        child: Column(
                          children: [
                            SizedBox(height: (MediaQuery.of(context).size.height / 2) - 150),
                            Text(
                              Intl.message("no_badges", name: "no_badges"),
                              style: GoogleFonts.roboto(color: Colors.black, fontSize: 18, fontWeight: FontWeight.w400),
                            ),
                          ],
                        ),
                      ),
                    if (uiMode == Const.profileUI && _responseUser != null)
                      Profile(
                          'try', "", handleProfileCallbacks, _responseUser!),
                    if (uiMode == Const.profileUI && _responseUser == null)
                      Expanded(
                        flex: 1,
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircularProgressIndicator(color: const Color(0xFF4598D1)),
                              const SizedBox(height: 16),
                              Text('Chargement du profil...', style: GoogleFonts.roboto(color: const Color(0xFF647483), fontSize: 14)),
                            ],
                          ),
                        ),
                      ),
                    if (uiMode == Const.searchEventUI &&
                        getEventsInit &&
                        filteredEvents.isNotEmpty)
                      Expanded(
                        flex: 1,
                        child: Container(
                          child: ListView.builder(
                            padding: EdgeInsets.zero,
                            scrollDirection: Axis.vertical,
                            itemCount: filteredEvents.length,
                            itemBuilder: (context, index) {
                              return CurrentEvents(filteredEvents[index], index,
                                  handleEventDetailsCallback);
                            },
                            // reverse: true,
                            physics: BouncingScrollPhysics(),
                          ),
                        ),
                      ),
                    if (uiMode == Const.searchEventUI &&
                        getEventsInit &&
                        filteredEvents.isEmpty &&
                        textController.text.toString().isNotEmpty)
                      Expanded(
                        flex: 1,
                        child: Container(
                          child: Padding(
                            padding: EdgeInsets.only(top: 30),
                            child: Text(
                              Intl.message("msg_no_events_search",
                                  name: "msg_no_events_search"),
                              style: GoogleFonts.roboto(
                                  color: Colors.black,
                                  fontStyle: FontStyle.normal,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w400),
                            ),
                          ),
                        ),
                      ),
                    if (uiMode == Const.eBadgeDetailsUI && ebadgeItemPosition >= 0 && ebadgeItemPosition < _myEbadges.length)
                      EBadgeDetails(
                        registration: _myEbadges[ebadgeItemPosition],
                        userName: _responseUser?.name ?? '',
                        userCompany: _responseUser?.company,
                      ),

                    // Bottom Section
                    CustomBottomBar(uiMode, handleCallback)
                  ],
                ),
                if (loader) Progressbar(loader),
              ],
            ),
          )),
    );
  }

  Future<void> playSound() async {
    try {
      await audioPlayer!.play();
    } catch (e) {
      print('Error playing audio: $e');
    }
  }

  Widget _scanner() {
    return Center(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Expanded(
              child: camState
                  ? Stack(
                      children: [
                        Center(
                          child: QrCamera(
                            onError: (context, error) => Text(
                              error.toString(),
                              style: TextStyle(color: Colors.red),
                            ),
                            cameraDirection: CameraDirection.BACK,
                            qrCodeCallback: (code) {
                              if (uiMode == Const.scanUI) {
                                setState(() {
                                  if (scanResult != code) {
                                    scanResult = code!;
                                    try {
                                      vibrateOnce();
                                      List<String> strResult =
                                          scanResult.split("-");
                                      if (strResult.length > 1) {
                                        addUserToContact(strResult);
                                      } else {
                                        Utils.showToast(Intl.message(
                                            "msg_scan_correct_ebadge",
                                            name: "msg_scan_correct_ebadge"));
                                      }
                                    } catch (e) {
                                      Utils.showToast(Intl.message(
                                          "msg_scan_correct_ebadge",
                                          name: "msg_scan_correct_ebadge"));
                                    }
                                  }
                                });
                              }
                            },
                          ),
                        ),
                        Container(
                          decoration: ShapeDecoration(
                              shape: QrScannerOverlayShape(
                                  borderColor: Colors.green,
                                  borderRadius: 10,
                                  borderLength: 30,
                                  borderWidth: 10,
                                  cutOutSize: 300)),
                        ),
                      ],
                    )
                  : Center(child: Text("Camera inactive"))),
        ],
      ),
    );
  }
}


/// Bouton carré icône + label utilisé dans les sections accès rapide et médias
class _QuickBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _QuickBtn({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 26),
            const SizedBox(height: 6),
            Text(label,
                style: GoogleFonts.roboto(color: color, fontSize: 11, fontWeight: FontWeight.w600),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}
