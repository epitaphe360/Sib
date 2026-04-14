import 'dart:convert';

class ResponseSchedule {
  List<DayInfo>? data;
  Meta? meta;

  ResponseSchedule({
    this.data,
    this.meta,
  });

  factory ResponseSchedule.fromRawJson(String str) => ResponseSchedule.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseSchedule.fromJson(Map<String, dynamic> json) => ResponseSchedule(
    data: json["data"] == null ? [] : List<DayInfo>.from(json["data"]!.map((x) => DayInfo.fromJson(x))),
    meta: json["meta"] == null ? null : Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data == null ? [] : List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class DayInfo {
  int? id;
  DateTime? date;
  String? startTime;
  String? name;
  String? slug;
  String? description;
  String? location;
  String? endTime;
  int? availableSeats;
  DateTime? createdAt;
  DateTime? updatedAt;
  Banner? banner;
  int? index=0;

  DayInfo({
    this.id,
    this.date,
    this.startTime,
    this.name,
    this.slug,
    this.description,
    this.location,
    this.endTime,
    this.availableSeats,
    this.createdAt,
    this.updatedAt,
    this.banner,
    this.index
  });

  factory DayInfo.fromRawJson(String str) => DayInfo.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory DayInfo.fromJson(Map<String, dynamic> json) => DayInfo(
    id: json["id"],
    date: json["date"] == null ? null : DateTime.parse(json["date"]),
    startTime: json["startTime"],
    name: json["name"],
    slug: json["slug"],
    description: json["description"],
    location: json["location"],
    endTime: json["endTime"],
    availableSeats: json["availableSeats"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
    banner: json["banner"] == null ? null : Banner.fromJson(json["banner"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "date": "${date!.year.toString().padLeft(4, '0')}-${date!.month.toString().padLeft(2, '0')}-${date!.day.toString().padLeft(2, '0')}",
    "startTime": startTime,
    "name": name,
    "slug": slug,
    "description": description,
    "location": location,
    "endTime": endTime,
    "availableSeats": availableSeats,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
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
  Formats? formats;
  String? hash;
  Ext? ext;
  Mime? mime;
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
    "hash": hash,
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
  Large? small;
  Large? medium;
  Large? thumbnail;
  Large? large;

  Formats({
    this.small,
    this.medium,
    this.thumbnail,
    this.large,
  });

  factory Formats.fromRawJson(String str) => Formats.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Formats.fromJson(Map<String, dynamic> json) => Formats(
    small: json["small"] == null ? null : Large.fromJson(json["small"]),
    medium: json["medium"] == null ? null : Large.fromJson(json["medium"]),
    thumbnail: json["thumbnail"] == null ? null : Large.fromJson(json["thumbnail"]),
    large: json["large"] == null ? null : Large.fromJson(json["large"]),
  );

  Map<String, dynamic> toJson() => {
    "small": small?.toJson(),
    "medium": medium?.toJson(),
    "thumbnail": thumbnail?.toJson(),
    "large": large?.toJson(),
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
  IMAGE_JPEG
}

final mimeValues = EnumValues({
  "image/jpeg": Mime.IMAGE_JPEG
});

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
