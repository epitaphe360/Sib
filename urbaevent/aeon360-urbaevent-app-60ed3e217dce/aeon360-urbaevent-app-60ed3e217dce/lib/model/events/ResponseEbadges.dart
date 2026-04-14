import 'dart:convert';

class ResponseEbadges {
  List<Datum> data;
  Meta meta;

  ResponseEbadges({
    required this.data,
    required this.meta,
  });

  factory ResponseEbadges.fromRawJson(String str) => ResponseEbadges.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseEbadges.fromJson(Map<String, dynamic> json) => ResponseEbadges(
    data: List<Datum>.from(json["data"].map((x) => Datum.fromJson(x))),
    meta: Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "data": List<dynamic>.from(data.map((x) => x.toJson())),
    "meta": meta.toJson(),
  };
}

class Datum {
  int id;
  dynamic booth;
  String type;
  bool? confirmed;
  DateTime createdAt;
  DateTime updatedAt;
  UserInfo user;
  Event event;

  Datum({
    required this.id,
    required this.booth,
    required this.type,
     this.confirmed,
    required this.createdAt,
    required this.updatedAt,
    required this.user,
    required this.event,
  });

  factory Datum.fromRawJson(String str) => Datum.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
    id: json["id"],
    booth: json["booth"],
    type: json["type"],
    confirmed: json["confirmed"],
    createdAt: DateTime.parse(json["createdAt"]),
    updatedAt: DateTime.parse(json["updatedAt"]),
    user: UserInfo.fromJson(json["user"]),
    event: Event.fromJson(json["event"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "booth": booth,
    "type": type,
    "confirmed": confirmed,
    "createdAt": createdAt.toIso8601String(),
    "updatedAt": updatedAt.toIso8601String(),
    "user": user.toJson(),
    "event": event.toJson(),
  };
}

class Event {
  int id;
  String name;
  String organizer;
  String? description;
  String? fullDescription;
  DateTime startDate;
  DateTime endDate;
  String dateString;
  String timeString;
  String locationAddress;
  String locationLatLng;
  DateTime createdAt;
  DateTime updatedAt;
  Banner? logo;

  Event({
    required this.id,
    required this.name,
    required this.organizer,
    this.description,
    this.fullDescription,
    required this.startDate,
    required this.endDate,
    required this.dateString,
    required this.timeString,
    required this.locationAddress,
    required this.locationLatLng,
    required this.createdAt,
    required this.updatedAt,
    this.logo,
  });

  factory Event.fromRawJson(String str) => Event.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Event.fromJson(Map<String, dynamic> json) => Event(
    id: json["id"],
    name: json["name"],
    organizer: json["organizer"],
    description: json["description"],
    fullDescription: json["fullDescription"],
    startDate: DateTime.parse(json["startDate"]),
    endDate: DateTime.parse(json["endDate"]),
    dateString: json["dateString"],
    timeString: json["timeString"],
    locationAddress: json["locationAddress"],
    locationLatLng: json["locationLatLng"],
    createdAt: DateTime.parse(json["createdAt"]),
    updatedAt: DateTime.parse(json["updatedAt"]),
    logo: Banner.fromJson(json["logo"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "organizer": organizer,
    "description": description,
    "fullDescription": fullDescription,
    "startDate": startDate.toIso8601String(),
    "endDate": endDate.toIso8601String(),
    "dateString": dateString,
    "timeString": timeString,
    "locationAddress": locationAddress,
    "locationLatLng": locationLatLng,
    "createdAt": createdAt.toIso8601String(),
    "updatedAt": updatedAt.toIso8601String(),
    "logo": logo?.toJson(),
  };
}

class Banner {
  int id;
  String name;
  dynamic alternativeText;
  dynamic caption;
  int width;
  int height;
  String hash;
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
    required this.hash,
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
    hash: json["hash"],
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
    "url": url,
    "previewUrl": previewUrl,
    "provider": provider,
    "provider_metadata": providerMetadata,
    "createdAt": createdAt.toIso8601String(),
    "updatedAt": updatedAt.toIso8601String(),
  };
}


class UserInfo {
  int id;
  String username;
  String email;
  String? emailOtp;
  String provider;
  bool confirmed;
  bool blocked;
  String name;
  String? phone;
  String? company;
  String? jobPosition;
  String? country;
  String lang;
  DateTime createdAt;
  DateTime updatedAt;

  UserInfo({
    required this.id,
    required this.username,
    required this.email,
    this.emailOtp,
    required this.provider,
    required this.confirmed,
    required this.blocked,
    required this.name,
    this.phone,
    this.company,
    this.jobPosition,
    this.country,
    required this.lang,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserInfo.fromRawJson(String str) => UserInfo.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UserInfo.fromJson(Map<String, dynamic> json) => UserInfo(
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
    createdAt: DateTime.parse(json["createdAt"]),
    updatedAt: DateTime.parse(json["updatedAt"]),
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
    "createdAt": createdAt.toIso8601String(),
    "updatedAt": updatedAt.toIso8601String(),
  };
}

class Meta {
  Pagination pagination;

  Meta({
    required this.pagination,
  });

  factory Meta.fromRawJson(String str) => Meta.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Meta.fromJson(Map<String, dynamic> json) => Meta(
    pagination: Pagination.fromJson(json["pagination"]),
  );

  Map<String, dynamic> toJson() => {
    "pagination": pagination.toJson(),
  };
}

class Pagination {
  int page;
  int pageSize;
  int pageCount;
  int total;

  Pagination({
    required this.page,
    required this.pageSize,
    required this.pageCount,
    required this.total,
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
