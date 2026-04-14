import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class CircularImageView extends StatefulWidget {
  final String imageUrl;
  final double radius;

  CircularImageView({required this.imageUrl, this.radius = 25.0});

  @override
  _CircularImageViewState createState() => _CircularImageViewState();
}

class _CircularImageViewState extends State<CircularImageView> {
  bool isImageLoaded = false;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CircleAvatar(
          radius: widget.radius,
          backgroundColor: Colors.white,
          child: Center(
            child: Stack(
              alignment: Alignment.center,
              children: [
                SvgPicture.asset(
                  "assets/ic_user.svg",
                  width: widget.radius * 2,
                ),
                SvgPicture.asset(
                  "assets/ic_user_avatar.svg",
                ),
              ],
            ),
          ),
        ),
        CircleAvatar(
          radius: widget.radius,
          backgroundColor: Colors.transparent,
          child: CachedNetworkImage(
            imageUrl: widget.imageUrl,
            imageBuilder: (context, imageProvider) => CircleAvatar(
              radius: widget.radius,
              backgroundImage: imageProvider,
            ),
            placeholder: (context, url) => CircularProgressIndicator(),
            errorWidget: (context, url, error) => SvgPicture.asset(
              "assets/ic_user.svg",
              width: widget.radius * 2,
            ),
          ),
        ),
      ],
    );
  }
}
