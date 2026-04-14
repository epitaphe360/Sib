import 'package:com.urbaevent/model/agent/ResponseMyScans.dart';
import 'package:com.urbaevent/utils/Preference.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Urls.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:com.urbaevent/widgets/CircularImageUserView.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MyScan extends StatefulWidget {
  final ScanItem datum;
  final position;

  MyScan(this.position, this.datum);

  @override
  State<MyScan> createState() => _MyScan();
}

class _MyScan extends State<MyScan> {


  String type = "";

  @override
  void initState() {
    super.initState();
    getType();
  }

  Future<void> getType() async {
    Preference preference = await Preference.getInstance();
    setState(() {
      if(preference.getLanguage()=="fr"){
        if(widget.datum.type!.toLowerCase()=="visitor") {
          type= "Visiteur";
        }else if(widget.datum.type!.toLowerCase()=="exhibitor"){
          type= "Exposant";
        }else{
          type=widget.datum.type!;
        }
      }else{
        type=widget.datum.type!;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    String imgUrl = "";
    if (widget.datum.user!.avatar != null) {
      imgUrl = Urls.imageURL + widget.datum.user!.avatar!.url!;
    } else {
      imgUrl = Urls.imageURL;
    }

    return Card(
      margin: new EdgeInsets.only(top: 16.0, left: 16, right: 16),
      elevation: 3.0,
      shadowColor: Color.fromRGBO(158, 158, 158, 0.2549019607843137),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      color: Colors.white,
      child: Container(
        decoration: BoxDecoration(color: Colors.white,borderRadius:BorderRadius.all(Radius.circular(10))),
        height: 95,
        child: Row(children: [
          SizedBox(width: 10),
          CircularImageView(
            imageUrl: imgUrl,
          ),
          Expanded(
            flex: 1,
            child: Container(

              margin: EdgeInsets.all(8),
              alignment: Alignment.topLeft,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 120,
                        child: Text(
                          widget.datum.user!.name??" ",
                          style: GoogleFonts.roboto(
                              color: Colors.black,
                              fontStyle: FontStyle.normal,
                              fontSize: 16,
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Container(
                        width: 80,
                        child: Text(
                          Utils.capitalizeFirstLetter(type),
                          style: GoogleFonts.roboto(
                              color: ThemeColor.colorAccent,
                              fontStyle: FontStyle.normal,
                              fontSize: 16,
                              fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 5,
                  ),
                  Row(
                    children: [
                      Container(
                        width: 120,
                        child: Text(
                          widget.datum.gate!.name??" ",
                          maxLines: 1,
                          style: GoogleFonts.roboto(
                              color: ThemeColor.colorAccent,
                              fontStyle: FontStyle.normal,
                              fontSize: 14,
                              fontWeight: FontWeight.w500),
                        ),
                      ),
                      SizedBox(
                        width: 10,
                      ),
                      Container(
                        width: 150,
                        child: Text(
                          widget.datum.event!.name??" ",
                          maxLines: 2,
                          style: GoogleFonts.roboto(
                              color: ThemeColor.colorAccent,
                              fontStyle: FontStyle.normal,
                              fontSize: 14,
                              fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ]),
      ),
    );
  }
}
