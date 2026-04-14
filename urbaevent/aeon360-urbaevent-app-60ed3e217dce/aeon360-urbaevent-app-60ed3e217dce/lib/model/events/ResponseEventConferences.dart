import 'dart:convert';

class ResponseEventConferences {
  List<Datum> data;
  Meta meta;

  ResponseEventConferences({
    required this.data,
    required this.meta,
  });

  factory ResponseEventConferences.fromRawJson(String str) =>
      ResponseEventConferences.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseEventConferences.fromJson(Map<String, dynamic> json) =>
      ResponseEventConferences(
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
  String name;
  String slug;
  String description;
  DateTime date;
  String location;
  String startTime;
  String endTime;
  int? availableSeats;
  DateTime createdAt;
  DateTime updatedAt;
  Banner banner;
  bool? isConfirmed;

  Datum(
      {required this.id,
      required this.name,
      required this.slug,
      required this.description,
      required this.date,
      required this.location,
      required this.startTime,
      required this.endTime,
        this.availableSeats,
      required this.createdAt,
      required this.updatedAt,
      required this.banner,
      this.isConfirmed});

  factory Datum.fromRawJson(String str) => Datum.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Datum.fromJson(Map<String, dynamic> json) => Datum(
        id: json["id"],
        name: json["name"],
        slug: json["slug"],
        description: json["description"],
        date: DateTime.parse(json["date"]),
        location: json["location"],
        startTime: json["startTime"],
        endTime: json["endTime"],
        availableSeats: json["availableSeats"],
        createdAt: DateTime.parse(json["createdAt"]),
        updatedAt: DateTime.parse(json["updatedAt"]),
        banner: Banner.fromJson(json["banner"]),
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "slug": slug,
        "description": description,
        "date":
            "${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}",
        "location": location,
        "startTime": startTime,
        "endTime": endTime,
        "availableSeats": availableSeats,
        "createdAt": createdAt.toIso8601String(),
        "updatedAt": updatedAt.toIso8601String(),
        "banner": banner.toJson(),
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
  double size;
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
    required this.size,
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
        "size": size,
        "url": url,
        "previewUrl": previewUrl,
        "provider": provider,
        "provider_metadata": providerMetadata,
        "createdAt": createdAt.toIso8601String(),
        "updatedAt": updatedAt.toIso8601String(),
      };
}

enum Ext { JPG }

final extValues = EnumValues({".jpg": Ext.JPG});

class Formats {
  Medium? large;
  Medium small;
  Medium medium;
  Medium thumbnail;

  Formats({
    this.large,
    required this.small,
    required this.medium,
    required this.thumbnail,
  });

  factory Formats.fromRawJson(String str) => Formats.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Formats.fromJson(Map<String, dynamic> json) => Formats(
        large: json["large"] == null ? null : Medium.fromJson(json["large"]),
        small: Medium.fromJson(json["small"]),
        medium: Medium.fromJson(json["medium"]),
        thumbnail: Medium.fromJson(json["thumbnail"]),
      );

  Map<String, dynamic> toJson() => {
        "large": large?.toJson(),
        "small": small.toJson(),
        "medium": medium.toJson(),
        "thumbnail": thumbnail.toJson(),
      };
}

class Medium {
  Ext ext;
  String url;
  String hash;
  Mime mime;
  String name;
  dynamic path;
  double size;
  int width;
  int height;

  Medium({
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

  factory Medium.fromRawJson(String str) => Medium.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Medium.fromJson(Map<String, dynamic> json) => Medium(
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

enum Mime { IMAGE_JPEG }

final mimeValues = EnumValues({"image/jpeg": Mime.IMAGE_JPEG});

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

  factory Pagination.fromRawJson(String str) =>
      Pagination.fromJson(json.decode(str));

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
