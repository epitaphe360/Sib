import 'dart:convert';

class ResponsePortal {
  List<PortalItem>? data;
  Meta? meta;

  ResponsePortal({
    this.data,
    this.meta,
  });

  factory ResponsePortal.fromRawJson(String str) => ResponsePortal.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponsePortal.fromJson(Map<String, dynamic> json) => ResponsePortal(
    data: json["data"] == null ? [] : List<PortalItem>.from(json["data"]!.map((x) => PortalItem.fromJson(x))),
    meta: json["meta"] == null ? null : Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data == null ? [] : List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class PortalItem {
  int? id;
  String? booth;
  String? type;
  bool? confirmed;
  DateTime? createdAt;
  DateTime? updatedAt;
  Gate? gate;
  PortalUser? user;

  PortalItem({
    this.id,
    this.booth,
    this.type,
    this.confirmed,
    this.createdAt,
    this.updatedAt,
    this.gate,
    this.user,

  });

  factory PortalItem.fromRawJson(String str) => PortalItem.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory PortalItem.fromJson(Map<String, dynamic> json) => PortalItem(
    id: json["id"],
    booth: json["booth"],
    type: json["type"],
    confirmed: json["confirmed"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
    gate: json["gate"] == null ? null : Gate.fromJson(json["gate"]),
    user: json["user"] == null ? null : PortalUser.fromJson(json["user"]),

  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "booth": booth,
    "type": type,
    "confirmed": confirmed,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
    "gate": gate?.toJson(),
    "user": user?.toJson(),
  };
}

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

class PortalUser {
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
  String? businessSector;

  PortalUser({
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
    this.businessSector
  });

  factory PortalUser.fromRawJson(String str) => PortalUser.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory PortalUser.fromJson(Map<String, dynamic> json) => PortalUser(
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
    businessSector: json["businessSector"],
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
    "businessSector":businessSector
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
