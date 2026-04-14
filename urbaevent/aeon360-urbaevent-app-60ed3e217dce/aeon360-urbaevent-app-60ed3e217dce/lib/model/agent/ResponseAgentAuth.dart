import 'dart:convert';

class ResponseAgentAuth {
  int? id;
  String? username;
  String? email;
  dynamic emailOtp;
  String? provider;
  bool? confirmed;
  bool? blocked;
  String? name;
  String? phone;
  dynamic company;
  dynamic jobPosition;
  dynamic country;
  String? lang;
  DateTime? createdAt;
  DateTime? updatedAt;
  dynamic lastNotificationIndex;
  Role? role;
  Avatar? avatar;
  EventControl? eventControl;

  ResponseAgentAuth(
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
      this.createdAt,
      this.updatedAt,
      this.lastNotificationIndex,
      this.role,
      this.avatar,
      this.eventControl});

  factory ResponseAgentAuth.fromRawJson(String str) =>
      ResponseAgentAuth.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseAgentAuth.fromJson(Map<String, dynamic> json) =>
      ResponseAgentAuth(
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
        eventControl: json["eventControl"] == null
            ? null
            : EventControl.fromJson(json["eventControl"]),
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
        "avatar": avatar,
        "eventControl": eventControl?.toJson(),
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

class EventControl {
  int? id;
  String? name;
  String? slug;
  String? organizer;
  String? description;
  String? fullDescription;
  DateTime? startDate;
  DateTime? endDate;
  String? dateString;
  String? timeString;
  String? locationAddress;
  String? locationLatLng;
  DateTime? createdAt;
  DateTime? updatedAt;
  bool? enabled;
  Banner? banner;

  EventControl(
      {this.id,
      this.name,
      this.slug,
      this.organizer,
      this.description,
      this.fullDescription,
      this.startDate,
      this.endDate,
      this.dateString,
      this.timeString,
      this.locationAddress,
      this.locationLatLng,
      this.createdAt,
      this.updatedAt,
      this.enabled,
      this.banner});

  factory EventControl.fromRawJson(String str) =>
      EventControl.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory EventControl.fromJson(Map<String, dynamic> json) => EventControl(
        id: json["id"],
        name: json["name"],
        slug: json["slug"],
        organizer: json["organizer"],
        description: json["description"],
        fullDescription: json["fullDescription"],
        startDate: json["startDate"] == null
            ? null
            : DateTime.parse(json["startDate"]),
        endDate:
            json["endDate"] == null ? null : DateTime.parse(json["endDate"]),
        dateString: json["dateString"],
        timeString: json["timeString"],
        locationAddress: json["locationAddress"],
        locationLatLng: json["locationLatLng"],
        createdAt: json["createdAt"] == null
            ? null
            : DateTime.parse(json["createdAt"]),
        updatedAt: json["updatedAt"] == null
            ? null
            : DateTime.parse(json["updatedAt"]),
        enabled: json["enabled"],
        banner: json["banner"] == null ? null : Banner.fromJson(json["banner"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "slug": slug,
        "organizer": organizer,
        "description": description,
        "fullDescription": fullDescription,
        "startDate": startDate?.toIso8601String(),
        "endDate": endDate?.toIso8601String(),
        "dateString": dateString,
        "timeString": timeString,
        "locationAddress": locationAddress,
        "locationLatLng": locationLatLng,
        "createdAt": createdAt?.toIso8601String(),
        "updatedAt": updatedAt?.toIso8601String(),
        "enabled": enabled,
        "banner": banner?.toJson(),
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

class Banner {
  int id;
  String name;
  dynamic alternativeText;
  dynamic caption;
  int width;
  int height;
  String url;
  dynamic previewUrl;
  String provider;
  dynamic providerMetadata;
  DateTime createdAt;
  DateTime updatedAt;

  Banner({
    required this.id,
    required this.name,
    required this.alternativeText,
    required this.caption,
    required this.width,
    required this.height,
    required this.url,
    required this.previewUrl,
    required this.provider,
    required this.providerMetadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Banner.fromRawJson(String str) => Banner.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Banner.fromJson(Map<String, dynamic> json) => Banner(
        id: json["id"],
        name: json["name"],
        alternativeText: json["alternativeText"],
        caption: json["caption"],
        width: json["width"],
        height: json["height"],
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
        "url": url,
        "previewUrl": previewUrl,
        "provider": provider,
        "provider_metadata": providerMetadata,
        "createdAt": createdAt.toIso8601String(),
        "updatedAt": updatedAt.toIso8601String(),
      };
}
