import 'dart:convert';

class ResponseAuthRole {
  int? id;
  String? username;
  String? email;
  String? emailOtp;
  String? provider;
  bool? confirmed;
  bool? blocked;
  String? name;
  String? phone;
  String? company;
  String? jobPosition;
  String? country;
  String? lang;

  DateTime? createdAt;
  DateTime? updatedAt;
  int? lastNotificationIndex;
  Role? role;
  Avatar? avatar;
  String? businessSector;
  bool? emailOTPConfirmed;

  ResponseAuthRole(
      {this.id,
      this.username,
      this.email,
      this.emailOtp,
      this.provider,
      this.confirmed,
      this.blocked,
      this.name,
      this.phone,
      this.company,
      this.jobPosition,
      this.country,
      this.lang,
      this.lastNotificationIndex,
      this.createdAt,
      this.updatedAt,
      this.role,
      this.avatar,
      this.businessSector,
      this.emailOTPConfirmed});

  factory ResponseAuthRole.fromRawJson(String str) =>
      ResponseAuthRole.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseAuthRole.fromJson(Map<String, dynamic> json) =>
      ResponseAuthRole(
        id: json["id"],
        username: json["username"],
        email: json["email"],
        emailOtp: json["emailOTP"],
        provider: json["provider"],
        confirmed: json["confirmed"],
        blocked: json["blocked"],
        name: json["name"],
        phone: json["phone"],
        company: json["company"],
        jobPosition: json["jobPosition"],
        country: json["country"],
        lang: json["lang"],
        createdAt: json["createdAt"] == null
            ? null
            : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null
            ? null
            : DateTime.parse(json["updatedAt"]),
        lastNotificationIndex: json["lastNotificationIndex"],
        role: json["role"] == null ? null : Role.fromJson(json["role"]),
        avatar: json["avatar"] == null ? null : Avatar.fromJson(json["avatar"]),
        businessSector: json["businessSector"],
        emailOTPConfirmed: json["emailOTPConfirmed"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "username": username,
        "email": email,
        "emailOTP": emailOtp,
        "provider": provider,
        "confirmed": confirmed,
        "blocked": blocked,
        "name": name,
        "phone": phone,
        "company": company,
        "jobPosition": jobPosition,
        "country": country,
        "lang": lang,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
        "lastNotificationIndex": lastNotificationIndex,
        "role": role?.toJson(),
        "avatar": avatar?.toJson(),
        "businessSector": businessSector,
    "emailOTPConfirmed": emailOTPConfirmed,
      };
}

class Avatar {
  int? id;
  String? name;
  dynamic alternativeText;
  dynamic caption;
  int? width;
  int? height;
  Formats? formats;
  String? hash;
  String? ext;
  String? mime;
  double? size;
  String? url;
  dynamic previewUrl;
  String? provider;
  dynamic providerMetadata;
  DateTime? createdAt;
  DateTime? updatedAt;

  Avatar({
    this.id,
    this.name,
    this.alternativeText,
    this.caption,
    this.width,
    this.height,
    this.formats,
    this.hash,
    this.ext,
    this.mime,
    this.size,
    this.url,
    this.previewUrl,
    this.provider,
    this.providerMetadata,
    this.createdAt,
    this.updatedAt,
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
        formats:
            json["formats"] == null ? null : Formats.fromJson(json["formats"]),
        hash: json["hash"],
        ext: json["ext"],
        mime: json["mime"],
        size: json["size"]?.toDouble(),
        url: json["url"],
        previewUrl: json["previewUrl"],
        provider: json["provider"],
        providerMetadata: json["provider_metadata"],
        createdAt: json["createdAt"] == null
            ? null
            : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null
            ? null
            : DateTime.parse(json["updatedAt"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "alternativeText": alternativeText,
        "caption": caption,
        "width": width,
        "height": height,
        "formats": formats?.toJson(),
        "hash": hash,
        "ext": ext,
        "mime": mime,
        "size": size,
        "url": url,
        "previewUrl": previewUrl,
        "provider": provider,
        "provider_metadata": providerMetadata,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
      };
}

class Formats {
  Large? large;
  Large? small;
  Large? medium;
  Large? thumbnail;

  Formats({
    this.large,
    this.small,
    this.medium,
    this.thumbnail,
  });

  factory Formats.fromRawJson(String str) => Formats.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Formats.fromJson(Map<String, dynamic> json) => Formats(
        large: json["large"] == null ? null : Large.fromJson(json["large"]),
        small: json["small"] == null ? null : Large.fromJson(json["small"]),
        medium: json["medium"] == null ? null : Large.fromJson(json["medium"]),
        thumbnail: json["thumbnail"] == null
            ? null
            : Large.fromJson(json["thumbnail"]),
      );

  Map<String, dynamic> toJson() => {
        "large": large?.toJson(),
        "small": small?.toJson(),
        "medium": medium?.toJson(),
        "thumbnail": thumbnail?.toJson(),
      };
}

class Large {
  String? ext;
  String? url;
  String? hash;
  String? mime;
  String? name;
  dynamic path;
  double? size;
  int? width;
  int? height;

  Large({
    this.ext,
    this.url,
    this.hash,
    this.mime,
    this.name,
    this.path,
    this.size,
    this.width,
    this.height,
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
  int? id;
  String? name;
  String? description;
  String? type;
  DateTime? createdAt;
  DateTime? updatedAt;

  Role({
    this.id,
    this.name,
    this.description,
    this.type,
    this.createdAt,
    this.updatedAt,
  });

  factory Role.fromRawJson(String str) => Role.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Role.fromJson(Map<String, dynamic> json) => Role(
        id: json["id"],
        name: json["name"],
        description: json["description"],
        type: json["type"],
        createdAt: json["createdAt"] == null
            ? null
            : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null
            ? null
            : DateTime.parse(json["updatedAt"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "description": description,
        "type": type,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
      };
}
