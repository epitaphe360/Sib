import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:com.urbaevent/model/events/ResponseEvents.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class CurrentEvents extends StatefulWidget {
  final Function(int) callback;
  final position;
  final EventItem _datum;

  CurrentEvents(this._datum, this.position, this.callback);


  @override
  State<CurrentEvents> createState() => _Events();
}

class _Events extends State<CurrentEvents> {

  String _resolveImageUrl() {
    // Priorité 1 : presentationUrl (utilisé pour stocker cover_url Supabase)
    if (widget._datum.presentationUrl != null && widget._datum.presentationUrl!.isNotEmpty) {
      return widget._datum.presentationUrl!;
    }
    // Priorité 2 : banner URL classique (ancien Strapi)
    if (widget._datum.banner != null && widget._datum.banner!.url.isNotEmpty) {
      final url = widget._datum.banner!.url;
      return url.startsWith('http') ? url : 'https://sbyizudifmqakzxjlndr.supabase.co/storage/v1$url';
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = _resolveImageUrl();
    return GestureDetector(
      onTap: () {
        widget.callback(0);
      },
      child: Center(
          child: Container(
        height: 192,
        width: double.infinity,
        margin: new EdgeInsets.only(left: 16.0, right: 16, bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20.0),
        ),
        child: Stack(children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: imageUrl.isNotEmpty
                ? CachedNetworkImage(
                    fit: BoxFit.cover,
                    height: 190,
                    width: MediaQuery.of(context).size.width,
                    imageUrl: imageUrl,
                    placeholder: (context, url) => Container(
                      alignment: Alignment.center,
                        height: 100,
                        child: Center(child: CircularProgressIndicator(color: Colors.black.withValues(alpha: 0.2),))),
                    errorWidget: (_, __, ___) => _placeholderBox(),
                  )
                : _placeholderBox(),
          ),
          Container(
            margin: EdgeInsets.all(16),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 85,
                  height: 28,
                  decoration: BoxDecoration(
                    color: Color.fromRGBO(69, 152, 209, 1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                Text(
                  DateFormat('dd-MMM yyyy').format(widget._datum.startDate),
                  style: GoogleFonts.roboto(
                      color: Colors.white,
                      fontStyle: FontStyle.normal,
                      fontSize: 11,
                      fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Image.asset(
                'assets/bg_gradient.png',
              )
            ],
          ),
          Container(
            margin: EdgeInsets.all(16),
            alignment: Alignment.topLeft,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  widget._datum.name,
                  style: GoogleFonts.roboto(
                      color: Colors.white,
                      fontStyle: FontStyle.normal,
                      fontSize: 18,
                      fontWeight: FontWeight.w700),
                ),
                SizedBox(
                  height: 5,
                ),
                Text(
                  'By ${widget._datum.organizer}',
                  style: GoogleFonts.roboto(
                      color: Colors.white,
                      fontStyle: FontStyle.normal,
                      fontSize: 14,
                      fontWeight: FontWeight.w400),
                ),
                SizedBox(
                  height: 5,
                ),
                Row(
                  children: [
                    Image.asset(
                      'assets/icon_location.png',
                      color: Colors.white,
                      width: 14,
                      height: 14,
                    ),
                    SizedBox(width: 10),
                    Container(
                      width: 295,
                      child: Text(
                        widget._datum.locationAddress,
                        maxLines: 1,
                        style: GoogleFonts.roboto(
                            color: Colors.white,
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
      )),
    );
  }

  Widget _placeholderBox() {
    return Container(
      height: 190,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ThemeColor.colorAccent, ThemeColor.colorAccent.withValues(alpha: 0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Text(
          widget._datum.name.isNotEmpty ? widget._datum.name[0].toUpperCase() : 'S',
          style: GoogleFonts.roboto(color: Colors.white, fontSize: 60, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
