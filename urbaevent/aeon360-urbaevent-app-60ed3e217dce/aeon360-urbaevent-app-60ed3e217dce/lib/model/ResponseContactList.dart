import 'dart:convert';

class ResponseContactList {
  List<ContactItem>? data;
  Meta? meta;

  ResponseContactList({
    this.data,
    this.meta,
  });

  factory ResponseContactList.fromRawJson(String str) => ResponseContactList.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseContactList.fromJson(Map<String, dynamic> json) => ResponseContactList(
    data: json["data"] == null ? [] : List<ContactItem>.from(json["data"]!.map((x) => ContactItem.fromJson(x))),
    meta: json["meta"] == null ? null : Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data == null ? [] : List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class ContactItem {
  int? id;
  String? typeScanner;
  String? typeScanned;
  DateTime? createdAt;
  DateTime? updatedAt;
  List<UserItem>? users;
  Event? event;

  ContactItem({
    this.id,
    this.typeScanner,
    this.typeScanned,
    this.createdAt,
    this.updatedAt,
    this.users,
    this.event,
  });

  factory ContactItem.fromRawJson(String str) => ContactItem.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ContactItem.fromJson(Map<String, dynamic> json) => ContactItem(
    id: json["id"],
    typeScanner: json["typeScanner"],
    typeScanned: json["typeScanned"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
    users: json["users"] == null ? [] : List<UserItem>.from(json["users"]!.map((x) => UserItem.fromJson(x))),
    event: json["event"] == null ? null : Event.fromJson(json["event"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "typeScanner": typeScanner,
    "typeScanned": typeScanned,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
    "users": users == null ? [] : List<dynamic>.from(users!.map((x) => x.toJson())),
    "event": event?.toJson(),
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
  };
}

class UserItem {
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
  Avatar? avatar;

  UserItem({
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
    this.avatar,
  });

  factory UserItem.fromRawJson(String str) => UserItem.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UserItem.fromJson(Map<String, dynamic> json) => UserItem(
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
    avatar: json["avatar"] == null ? null : Avatar.fromJson(json["avatar"]),
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
    "avatar": avatar?.toJson(),
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
    formats: json["formats"] == null ? null : Formats.fromJson(json["formats"]),
    hash: json["hash"],
    ext: json["ext"],
    mime: json["mime"],
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
  Thumbnail? thumbnail;

  Formats({
    this.thumbnail,
  });

  factory Formats.fromRawJson(String str) => Formats.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Formats.fromJson(Map<String, dynamic> json) => Formats(
    thumbnail: json["thumbnail"] == null ? null : Thumbnail.fromJson(json["thumbnail"]),
  );

  Map<String, dynamic> toJson() => {
    "thumbnail": thumbnail?.toJson(),
  };
}

class Thumbnail {
  String? ext;
  String? url;
  String? hash;
  String? mime;
  String? name;
  dynamic path;
  double? size;
  int? width;
  int? height;

  Thumbnail({
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

  factory Thumbnail.fromRawJson(String str) => Thumbnail.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Thumbnail.fromJson(Map<String, dynamic> json) => Thumbnail(
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
