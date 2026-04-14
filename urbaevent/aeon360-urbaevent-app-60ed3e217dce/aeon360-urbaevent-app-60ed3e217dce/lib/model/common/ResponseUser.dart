import 'dart:convert';

class ResponseUser {
  int id;
  String username;
  String email;
  String? emailOtp;
  bool confirmed;
  bool blocked;
  String name;
  String? socialId;
  String? phone;
  String? company;
  String? jobPosition;
  String? businessSector;
  String? country;
  String? lang;
  int? lastNotificationIndex;
  Role? role;
  Avatar? avatar;
  bool? emailOTPConfirmed;

  ResponseUser(
      {required this.id,
      required this.username,
      required this.email,
      this.emailOtp,
      required this.confirmed,
      required this.blocked,
      required this.name,
      this.phone,
      this.socialId,
      this.company,
      this.jobPosition,
      this.businessSector,
      this.country,
      this.lang,
      this.role,
      this.avatar,
      this.emailOTPConfirmed});

  factory ResponseUser.fromRawJson(String str) =>
      ResponseUser.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseUser.fromJson(Map<String, dynamic> json) => ResponseUser(
      id: json["id"],
      username: json["username"],
      email: json["email"],
      emailOtp: json["emailOTP"],
      confirmed: json["confirmed"],
      blocked: json["blocked"],
      name: json["name"],
      phone: json["phone"],
      socialId: json["socialId"],
      company: json["company"],
      jobPosition: json["jobPosition"],
      businessSector: json["businessSector"],
      country: json["country"],
      lang: json["lang"],
      role: json["role"] == null ? null : Role.fromJson(json["role"]),
      avatar: json["avatar"] == null ? null : Avatar.fromJson(json["avatar"]),
      emailOTPConfirmed: json["emailOTPConfirmed"]);

  Map<String, dynamic> toJson() => {
        "id": id,
        "username": username,
        "email": email,
        "emailOTP": emailOtp,
        "confirmed": confirmed,
        "blocked": blocked,
        "name": name,
        "phone": phone,
        "socialId": socialId,
        "company": company,
        "jobPosition": jobPosition,
        "businessSector": businessSector,
        "country": country,
        "lang": lang,
        "lastNotificationIndex": lastNotificationIndex,

        "role": role!.toJson(),
        "avatar": avatar!.toJson(),
        "emailOTPConfirmed": emailOTPConfirmed
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
  int id;
  String name;
  dynamic alternativeText;
  dynamic caption;
  int width;
  int height;
  String hash;
  String ext;
  String mime;
  double size;
  String url;
  dynamic previewUrl;
  String provider;
  dynamic providerMetadata;
  DateTime createdAt;
  DateTime updatedAt;

  Avatar({
    required this.id,
    required this.name,
    required this.alternativeText,
    required this.caption,
    required this.width,
    required this.height,
    required this.hash,
    required this.ext,
    required this.mime,
    required this.size,
    required this.url,
    required this.previewUrl,
    required this.provider,
    required this.providerMetadata,
    required this.createdAt,
    required this.updatedAt,
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
        hash: json["hash"],
        ext: json["ext"],
        mime: json["mime"],
        size: json["size"]?.toDouble(),
        url: json["url"],
        previewUrl: json["previewUrl"],
        provider: json["provider"],
        providerMetadata: json["provider_metadata"],
        createdAt: DateTime.parse(json["createdAt"]),
        updatedAt: DateTime.parse(json["updatedAt"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "alternativeText": alternativeText,
        "caption": caption,
        "width": width,
        "height": height,
        "hash": hash,
        "ext": ext,
        "mime": mime,
        "size": size,
        "url": url,
        "previewUrl": previewUrl,
        "provider": provider,
        "provider_metadata": providerMetadata,
        "createdAt": createdAt.toIso8601String(),
        "updatedAt": updatedAt.toIso8601String(),
      };
}

class Formats {
  Large large;
  Large small;
  Large medium;
  Large thumbnail;

  Formats({
    required this.large,
    required this.small,
    required this.medium,
    required this.thumbnail,
  });

  factory Formats.fromRawJson(String str) => Formats.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Formats.fromJson(Map<String, dynamic> json) => Formats(
        large: Large.fromJson(json["large"]),
        small: Large.fromJson(json["small"]),
        medium: Large.fromJson(json["medium"]),
        thumbnail: Large.fromJson(json["thumbnail"]),
      );

  Map<String, dynamic> toJson() => {
        "large": large.toJson(),
        "small": small.toJson(),
        "medium": medium.toJson(),
        "thumbnail": thumbnail.toJson(),
      };
}

class Large {
  String ext;
  String url;
  String hash;
  String mime;
  String name;
  dynamic path;
  double size;
  int width;
  int height;

  Large({
    required this.ext,
    required this.url,
    required this.hash,
    required this.mime,
    required this.name,
    required this.path,
    required this.size,
    required this.width,
    required this.height,
  });

  factory Large.fromRawJson(String str) => Large.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Large.fromJson(Map<String, dynamic> json) => Large(
        ext: json["ext"],
        url: json["url"],
        hash: json["hash"],
        mime: json["mime"],
        name: json["name"],
        path: json["path"],
        size: json["size"]?.toDouble(),
        width: json["width"],
        height: json["height"],
      );

  Map<String, dynamic> toJson() => {
        "ext": ext,
        "url": url,
        "hash": hash,
        "mime": mime,
        "name": name,
        "path": path,
        "size": size,
        "width": width,
        "height": height,
      };
}

class Role {
  int id;
  String name;
  String description;
  String type;
  DateTime createdAt;
  DateTime updatedAt;

  Role({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Role.fromRawJson(String str) => Role.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Role.fromJson(Map<String, dynamic> json) => Role(
        id: json["id"],
        name: json["name"],
        description: json["description"],
        type: json["type"],
        createdAt: DateTime.parse(json["createdAt"]),
        updatedAt: DateTime.parse(json["updatedAt"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "description": description,
        "type": type,
        "createdAt": createdAt.toIso8601String(),
        "updatedAt": updatedAt.toIso8601String(),
      };
}
