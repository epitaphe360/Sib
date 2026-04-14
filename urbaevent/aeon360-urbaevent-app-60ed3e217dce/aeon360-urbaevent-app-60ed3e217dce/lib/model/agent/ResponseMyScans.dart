import 'dart:convert';

class ResponseMyScans {
  List<ScanItem>? data;
  Meta? meta;

  ResponseMyScans({
    this.data,
    this.meta,
  });

  factory ResponseMyScans.fromRawJson(String str) => ResponseMyScans.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseMyScans.fromJson(Map<String, dynamic> json) => ResponseMyScans(
    data: json["data"] == null ? [] : List<ScanItem>.from(json["data"]!.map((x) => ScanItem.fromJson(x))),
    meta: json["meta"] == null ? null : Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data == null ? [] : List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class ScanItem {
  int? id;
  DateTime? createdAt;
  DateTime? updatedAt;
  String? type;
  User? user;
  Event? event;
  Gate? gate;

  ScanItem({
    this.id,
    this.createdAt,
    this.updatedAt,
    this.type,
    this.user,
    this.event,
    this.gate,
  });

  factory ScanItem.fromRawJson(String str) => ScanItem.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ScanItem.fromJson(Map<String, dynamic> json) => ScanItem(
    id: json["id"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
    type: json["type"],
    user: json["user"] == null ? null : User.fromJson(json["user"]),
    event: json["event"] == null ? null : Event.fromJson(json["event"]),
    gate: json["gate"] == null ? null : Gate.fromJson(json["gate"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
    "user": user?.toJson(),
    "event": event?.toJson(),
    "gate": gate?.toJson(),
  };
}

class Event {
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

  Event({
    this.id,
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
    this.banner,
  });

  factory Event.fromRawJson(String str) => Event.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Event.fromJson(Map<String, dynamic> json) => Event(
    id: json["id"],
    name: json["name"],
    slug: json["slug"],
    organizer: json["organizer"],
    description: json["description"],
    fullDescription: json["fullDescription"],
    startDate: json["startDate"] == null ? null : DateTime.parse(json["startDate"]),
    endDate: json["endDate"] == null ? null : DateTime.parse(json["endDate"]),
    dateString: json["dateString"],
    timeString: json["timeString"],
    locationAddress: json["locationAddress"],
    locationLatLng: json["locationLatLng"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
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

class Banner {
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
  DateTime? createdAt;
  DateTime? updatedAt;

  Banner({
    this.id,
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
    this.createdAt,
    this.updatedAt,
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
    size: json["size"]?.toDouble(),
    url: json["url"],
    previewUrl: json["previewUrl"],
    provider: json["provider"],
    providerMetadata: json["provider_metadata"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
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
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
  };
}

enum Ext {
  JPG
}

final extValues = EnumValues({
  ".jpg": Ext.JPG
});

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
    thumbnail: json["thumbnail"] == null ? null : Large.fromJson(json["thumbnail"]),
  );

  Map<String, dynamic> toJson() => {
    "large": large?.toJson(),
    "small": small?.toJson(),
    "medium": medium?.toJson(),
    "thumbnail": thumbnail?.toJson(),
  };
}

class Large {
  Ext? ext;
  String? url;
  String? hash;
  Mime? mime;
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
    ext: extValues.map[json["ext"]]!,
    url: json["url"],
    hash: json["hash"],
    mime: mimeValues.map[json["mime"]]!,
    name: json["name"],
    path: json["path"],
    size: json["size"]?.toDouble(),
    width: json["width"],
    height: json["height"],
  );

  Map<String, dynamic> toJson() => {
    "ext": extValues.reverse[ext],
    "url": url,
    "hash": hash,
    "mime": mimeValues.reverse[mime],
    "name": name,
    "path": path,
    "size": size,
    "width": width,
    "height": height,
  };
}

enum Mime {
  APPLICATION_OCTET_STREAM,
  IMAGE_JPEG
}

final mimeValues = EnumValues({
  "application/octet-stream": Mime.APPLICATION_OCTET_STREAM,
  "image/jpeg": Mime.IMAGE_JPEG
});

class Gate {
  int? id;
  String? name;
  DateTime? createdAt;
  DateTime? updatedAt;

  Gate({
    this.id,
    this.name,
    this.createdAt,
    this.updatedAt,
  });

  factory Gate.fromRawJson(String str) => Gate.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Gate.fromJson(Map<String, dynamic> json) => Gate(
    id: json["id"],
    name: json["name"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
  };
}

class User {
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
  Banner? avatar;

  User({
    this.id,
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
    this.avatar,
  });

  factory User.fromRawJson(String str) => User.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory User.fromJson(Map<String, dynamic> json) => User(
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
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
    lastNotificationIndex: json["lastNotificationIndex"],
    avatar: json["avatar"] == null ? null : Banner.fromJson(json["avatar"]),
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
    "avatar": avatar?.toJson(),
  };
}

class Meta {
  Pagination? pagination;

  Meta({
    this.pagination,
  });

  factory Meta.fromRawJson(String str) => Meta.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Meta.fromJson(Map<String, dynamic> json) => Meta(
    pagination: json["pagination"] == null ? null : Pagination.fromJson(json["pagination"]),
  );

  Map<String, dynamic> toJson() => {
    "pagination": pagination?.toJson(),
  };
}

class Pagination {
  int? page;
  int? pageSize;
  int? pageCount;
  int? total;

  Pagination({
    this.page,
    this.pageSize,
    this.pageCount,
    this.total,
  });

  factory Pagination.fromRawJson(String str) => Pagination.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Pagination.fromJson(Map<String, dynamic> json) => Pagination(
    page: json["page"],
    pageSize: json["pageSize"],
    pageCount: json["pageCount"],
    total: json["total"],
  );

  Map<String, dynamic> toJson() => {
    "page": page,
    "pageSize": pageSize,
    "pageCount": pageCount,
    "total": total,
  };
}

class EnumValues<T> {
  Map<String, T> map;
  late Map<T, String> reverseMap;

  EnumValues(this.map);

  Map<T, String> get reverse {
    reverseMap = map.map((k, v) => MapEntry(v, k));
    return reverseMap;
  }
}
