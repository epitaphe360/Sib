import 'package:com.urbaevent/firebase_options.dart';
import 'package:com.urbaevent/utils/LanguageProvider.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/SalonBranding.dart';
import 'package:com.urbaevent/utils/SupabaseConfig.dart';
import 'package:dots_indicator/dots_indicator.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:com.urbaevent/ui/content_ui/agent/AgentHomepage.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/ui/content_ui/home/SalonListPage.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'generated/intl/messages_all.dart';
import 'utils/Preference.dart';


@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await setupFlutterNotifications();
}

/// Create a [AndroidNotificationChannel] for heads up notifications
late AndroidNotificationChannel channel;

bool isFlutterLocalNotificationsInitialized = false;

Future<void> setupFlutterNotifications() async {
  if (isFlutterLocalNotificationsInitialized) {
    return;
  }
  channel = const AndroidNotificationChannel(
    'high_importance_channel', // id
    'High Importance Notifications', // title
    description:
    'This channel is used for important notifications.', // description
    importance: Importance.high,
  );

  flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

  /// Create an Android Notification Channel.
  ///
  /// We use this channel in the `AndroidManifest.xml` file to override the
  /// default FCM channel to enable heads up notifications.
  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<
      AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);

  /// Update the iOS foreground notification presentation options to allow
  /// heads up notifications.
  await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
    alert: true,
    badge: true,
    sound: true,
  );
  isFlutterLocalNotificationsInitialized = true;
}


/// Initialize the [FlutterLocalNotificationsPlugin] package.
late FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin;



Future<void> main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  // ── Initialisation Supabase ──────────────────────────────────────
  await Supabase.initialize(
    url: SupabaseConfig.supabaseUrl,
    anonKey: SupabaseConfig.supabaseAnonKey,
  );
  // ── Branding dynamique depuis la table salons ─────────────────
  await SalonBranding.load();
  Preference preference = await Preference.getInstance();
  Intl.defaultLocale = preference.getLanguage();
  await initializeMessages(preference.getLanguage());
  // Set the background messaging handler early on, as a named top-level function
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  await FirebaseMessaging.instance.requestPermission();
  await Permission.notification.request();

  runApp(
    ChangeNotifierProvider(
      create: (context) => LanguageProvider(),
      // Create an instance of LanguageProvider
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final languageProvider = Provider.of<LanguageProvider>(context);
    return MaterialApp(
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: [
        const Locale('en', ''), // English
        const Locale('fr', ''), // French
      ],
      locale: languageProvider.locale,
      debugShowCheckedModeBanner: false,
      title: 'UNFM',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: ThemeColor.colorAccent,
        primaryColorLight: Colors.white,
        primaryColorDark: Colors.white,
        textSelectionTheme: TextSelectionThemeData(
          cursorColor: ThemeColor.colorAccent,
          selectionColor: ThemeColor.colorAccent,
          selectionHandleColor: ThemeColor.colorAccent,
        ),
        progressIndicatorTheme: ProgressIndicatorThemeData(circularTrackColor: ThemeColor.colorAccent),
        cardTheme: CardThemeData(
          surfaceTintColor: Colors.white,
          shadowColor: Color.fromRGBO(
            0, 0, 0, 0.2549019607843137),
        ),
      ),
      home: IntroPage(),
    );
  }
}

class IntroPage extends StatefulWidget {
  @override
  State<IntroPage> createState() => _IntroPageState();
}

class _IntroPageState extends State<IntroPage> {
  bool isInit = false;

  void initialization() async {
    FlutterNativeSplash.remove();
  }

  Future<void> checkFirstLogin() async {
    Preference preference = await Preference.getInstance();
    if (preference.getFirstCheck()) {
      preference.setFirstCheck(false);
      setState(() {
        isInit = true;
      });
    } else {
      if (preference.getAuthRole() != null &&
          preference.getAuthRole()!.role!.id == 3) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => AgentHomePage(Const.homeUI)),
          (route) => false,
        );
      } else {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => SalonListPage()),
          (route) => false,
        );
      }
    }
  }

  @override
  void initState() {
    super.initState();
    checkFirstLogin();
    initialization();
  }

  PageController controller =
      PageController(viewportFraction: 0.8, initialPage: 0);
  List<Widget> _list = <Widget>[
    Pages(
      title: Intl.message('welcome_msg1', name: 'welcome_msg1'),
      subtitle: Intl.message('welcome_sub_msg_1', name: 'welcome_sub_msg_1'),
    ),
    Pages(
      title: Intl.message('welcome_msg2', name: 'welcome_msg2'),
      subtitle: Intl.message('welcome_sub_msg_2', name: 'welcome_sub_msg_2'),
    ),
    Pages(
      title: Intl.message('welcome_msg3', name: 'welcome_msg3'),
      subtitle: Intl.message('welcome_sub_msg_3', name: 'welcome_sub_msg_3'),
    ),
  ];
  int _curr = 0;

  @override
  Widget build(BuildContext context) {
    return Container(
        color: Color.fromRGBO(249, 249, 255, 1),
        child: Stack(
          children: [
            if (isInit)
              Stack(
                children: [
                  Image.asset(
                    'assets/on_boarding_bg.png',
                    // Replace with the actual image URL
                    width: double.infinity,
                    fit: BoxFit.contain,
                  ),
                  Container(
                    width: double.infinity,
                    height: MediaQuery.of(context).size.height,
                    alignment: Alignment.bottomCenter,
                    margin: EdgeInsets.only(top: 250),
                    child: PageView(
                      children: _list,
                      scrollDirection: Axis.horizontal,

                      // reverse: true,
                      physics: BouncingScrollPhysics(),
                      controller: controller,
                      onPageChanged: (num) {
                        setState(() {
                          _curr = num;
                        });
                      },
                    ),
                  ),
                  Positioned(
                      bottom: 20,
                      left: 0,
                      right: 0, // Align at the bottom
                      child: Column(
                        verticalDirection: VerticalDirection.down,
                        children: [
                          DotsIndicator(
                            dotsCount: _list.length,
                            position: _curr,
                            decorator: DotsDecorator(
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(5.0)),
                              size: const Size(18.0, 8.0),
                              activeSize: const Size(34.0, 8.0),
                              activeShape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(5.0)),
                            ),
                          ),
                          SizedBox(
                            height: 20,
                          ),
                          Center(
                              child: TextButton(
                                  style: TextButton.styleFrom(
                                    fixedSize: Size(135, 35),
                                    backgroundColor:
                                        Color.fromRGBO(235, 154, 68, 1),
                                    // Set the background color to black
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(
                                          18.0), // Set the border radius
                                    ),
                                  ),
                                  onPressed: () async {
                                    setState(() {
                                      if (_curr == 2) {
                                        Navigator.pushAndRemoveUntil(
                                          context,
                                          MaterialPageRoute(
                                              builder: (context) =>
                                                  SalonListPage()),
                                          (route) => false,
                                        );
                                      } else {
                                        _curr++;
                                      }
                                      controller.jumpToPage(_curr);
                                    });
                                  },
                                  child: Text(
                                      Intl.message('next', name: 'next'),
                                      style: GoogleFonts.roboto(
                                          color: Colors.white,
                                          fontSize: 20,
                                          height: 1.1,
                                          fontWeight: FontWeight.w500)))),
                        ],
                      )),
                ],
              )
          ],
        ));
  }
}

class Pages extends StatelessWidget {
  final title;
  final subtitle;

  Pages({this.title, this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        height: 280,
        width: double.infinity,
        margin: new EdgeInsets.symmetric(horizontal: 16.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20.0),
        ),
        child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Text(
                title,
                textAlign: TextAlign.center,
                style: GoogleFonts.roboto(
                    fontSize: 30,
                    decoration: TextDecoration.none,
                    fontWeight: FontWeight.bold,
                    color: Colors.black),
              ),
              SizedBox(
                height: 20,
              ),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: GoogleFonts.roboto(
                    fontSize: 18,
                    decoration: TextDecoration.none,
                    fontWeight: FontWeight.w400,
                    color: Colors.black),
              ),
              SizedBox(
                height: 20,
              ),
              Center(
                  child: TextButton(
                      style: TextButton.styleFrom(
                        fixedSize: Size(230, 50),
                        backgroundColor: Color.fromRGBO(69, 152, 209, 1),
                        // Set the background color to black
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(
                              25.0), // Set the border radius
                        ),
                      ),
                      onPressed: () async {
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(
                              builder: (context) => HomePage(Const.homeUI)),
                          (route) => false,
                        );
                      },
                      child: Text(Intl.message('start', name: 'start'),
                          style: GoogleFonts.roboto(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w500)))),
            ]),
      ),
    );
  }
}
