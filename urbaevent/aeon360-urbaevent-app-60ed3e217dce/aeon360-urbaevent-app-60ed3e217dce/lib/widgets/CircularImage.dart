import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class CircularImage extends StatefulWidget {
  final String imageUrl;
  final double radius;

  CircularImage({required this.imageUrl, this.radius = 25.0});

  @override
  State<CircularImage> createState() => _DayInfoItem();
}

class _DayInfoItem extends State<CircularImage> {
  bool isLoaded = true;

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: widget.radius,
      backgroundColor: Colors.white, // Placeholder background color
      backgroundImage: CachedNetworkImageProvider(
        widget.imageUrl,
      ),
      child: Container(
        child: Center(
          child: Stack(
            alignment: Alignment.center,
            children: [
              if(!isLoaded)
              SvgPicture.asset(
                "assets/ic_user.svg",
                width: (widget.radius * 2),
              ),
              if(!isLoaded)
              Image.asset(
                "assets/icon_placeholder.png",
                width: (widget.radius),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
