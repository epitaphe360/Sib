import 'dart:convert';

class ResponseContactDetails {
  int? id;
  String? username;
  String? email;
  String? emailOtp;
  bool? confirmed;
  bool? blocked;
  String? name;
  String? phone;
  String? company;
  String? jobPosition;
  String? businessSector;
  String? country;
  String? lang;
  DateTime? createdAt;
  DateTime? updatedAt;
  Avatar? avatar;

  ResponseContactDetails({
    this.id,
    this.username,
    this.email,
    this.emailOtp,
    this.confirmed,
    this.blocked,
    this.name,
    this.phone,
    this.company,
    this.jobPosition,
    this.businessSector,
    this.country,
    this.lang,
    this.createdAt,
    this.updatedAt,
    this.avatar,
  });

  factory ResponseContactDetails.fromRawJson(String str) =>
      ResponseContactDetails.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseContactDetails.fromJson(Map<String, dynamic> json) =>
      ResponseContactDetails(
        id: json["id"],
        username: json["username"],
        email: json["email"],
        emailOtp: json["emailOTP"],
        confirmed: json["confirmed"],
        blocked: json["blocked"],
        name: json["name"],
        phone: json["phone"],
        company: json["company"],
        jobPosition: json["jobPosition"],
        businessSector: json["businessSector"],
        country: json["country"],
        lang: json["lang"],
        createdAt: json["createdAt"] == null
            ? null
            : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null
            ? null
            : DateTime.parse(json["updatedAt"]),
        avatar: json["avatar"] == null ? null : Avatar.fromJson(json["avatar"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "username": username,
        "email": email,
        "emailOTP": emailOtp,
        "confirmed": confirmed,
        "blocked": blocked,
        "name": name,
        "phone": phone,
        "company": company,
        "jobPosition": jobPosition,
        "businessSector": businessSector,
        "country": country,
        "lang": lang,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
        "avatar": avatar!.toJson(),
      };
}

class BusinessSector {
  int id;
  String name;

  BusinessSector({required this.id, required this.name});

  factory BusinessSector.fromRawJson(String str) =>
      BusinessSector.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory BusinessSector.fromJson(Map<String, dynamic> json) => BusinessSector(
        id: json["id"],
        name: json["name"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
      };
}

class Avatar {
  int? id;
  String? name;
  dynamic alternativeText;
  dynamic caption;
  int? width;
  int? height;
  double? size;
  String? url;
  dynamic previewUrl;
  String? provider;
  dynamic providerMetadata;

  Avatar({
    required this.id,
    this.name,
    this.alternativeText,
    this.caption,
    this.width,
    this.height,
    this.size,
    this.url,
    this.previewUrl,
    this.provider,
    this.providerMetadata,
  });

  factory Avatar.fromRawJson(String str) => Avatar.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Avatar.fromJson(Map<String, dynamic> json) => Avatar(
        id: json["id"],
        name: json["name"],
        alternativeText: json["alternativeText"],
        caption: json["caption"],
        width: json["width"],
        height: json["height"],
        size: json["size"]?.toDouble(),
        url: json["url"],
        previewUrl: json["previewUrl"],
        provider: json["provider"],
        providerMetadata: json["provider_metadata"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "alternativeText": alternativeText,
        "caption": caption,
        "width": width,
        "height": height,
        "size": size,
        "url": url,
        "previewUrl": previewUrl,
        "provider": provider,
        "provider_metadata": providerMetadata,
      };
}
