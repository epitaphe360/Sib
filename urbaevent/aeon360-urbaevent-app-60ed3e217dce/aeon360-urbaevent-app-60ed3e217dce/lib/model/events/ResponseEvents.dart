import 'dart:convert';

class ResponseEvents {
  List<EventItem> data;
  Meta meta;

  ResponseEvents({
    required this.data,
    required this.meta,
  });

  factory ResponseEvents.fromRawJson(String str) =>
      ResponseEvents.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseEvents.fromJson(Map<String, dynamic> json) => ResponseEvents(
        data: List<EventItem>.from(
            json["data"].map((x) => EventItem.fromJson(x))),
        meta: Meta.fromJson(json["meta"]),
      );

  Map<String, dynamic> toJson() => {
        "data": List<dynamic>.from(data.map((x) => x.toJson())),
        "meta": meta.toJson(),
      };
}

class EventItem {
  int id;
  String name;
  String organizer;
  String? description;
  String fullDescription;
  DateTime startDate;
  DateTime endDate;
  String? dateString;
  String? timeString;
  String locationAddress;
  String locationLatLng;
  String? presentationUrl;
  DateTime createdAt;
  DateTime updatedAt;
  Banner? banner;
  Logo? logo;
  String? registrationId;
  String? type;
  String? registrationType;
  String? phone;
  String? contact;

  EventItem(
      {required this.id,
      required this.name,
      required this.organizer,
      this.description,
      required this.fullDescription,
      required this.startDate,
      required this.endDate,
      this.dateString,
      this.timeString,
      required this.locationAddress,
      required this.locationLatLng,
      this.presentationUrl,
      required this.createdAt,
      required this.updatedAt,
      this.banner,
      this.logo,
      this.registrationId,
      this.type,
      this.registrationType,
      this.phone,
      this.contact});

  factory EventItem.fromRawJson(String str) =>
      EventItem.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory EventItem.fromJson(Map<String, dynamic> json) => EventItem(
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
      presentationUrl: json["presentationUrl"],
      createdAt: DateTime.parse(json["createdAt"]),
      updatedAt: DateTime.parse(json["updatedAt"]),
      banner: json["banner"] == null ? null : Banner.fromJson(json["banner"]),
      logo: json["logo"] == null ? null : Logo.fromJson(json["logo"]),
      type: json["type"],
      phone: json["phone"],
      contact: json["contact"]);

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
        "presentationUrl": presentationUrl,
        "createdAt": createdAt.toIso8601String(),
        "updatedAt": updatedAt.toIso8601String(),
        "banner": banner?.toJson(),
        "logo": logo?.toJson(),
        "type": type,
        "phone": phone,
        "contact": contact
      };
}

class Logo {
  int? id;
  String? name;
  dynamic alternativeText;
  dynamic caption;
  int? width;
  int? height;
  LogoFormats? formats;
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

  Logo({
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

  factory Logo.fromRawJson(String str) => Logo.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Logo.fromJson(Map<String, dynamic> json) => Logo(
        id: json["id"],
        name: json["name"],
        alternativeText: json["alternativeText"],
        caption: json["caption"],
        width: json["width"],
        height: json["height"],
        formats: json["formats"] == null
            ? null
            : LogoFormats.fromJson(json["formats"]),
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

class LogoFormats {
  Large? small;
  Large? thumbnail;

  LogoFormats({
    this.small,
    this.thumbnail,
  });

  factory LogoFormats.fromRawJson(String str) =>
      LogoFormats.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory LogoFormats.fromJson(Map<String, dynamic> json) => LogoFormats(
        small: json["small"] == null ? null : Large.fromJson(json["small"]),
        thumbnail: json["thumbnail"] == null
            ? null
            : Large.fromJson(json["thumbnail"]),
      );

  Map<String, dynamic> toJson() => {
        "small": small?.toJson(),
        "thumbnail": thumbnail?.toJson(),
      };
}

class Banner {
  int id;
  String name;
  dynamic alternativeText;
  dynamic caption;
  int width;
  int height;
  Formats? formats;
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

  Banner({
    required this.id,
    required this.name,
    required this.alternativeText,
    required this.caption,
    required this.width,
    required this.height,
    this.formats,
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

  factory Banner.fromRawJson(String str) => Banner.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Banner.fromJson(Map<String, dynamic> json) => Banner(
        id: json["id"],
        name: json["name"],
        alternativeText: json["alternativeText"],
        caption: json["caption"],
        width: json["width"],
        height: json["height"],
        formats: Formats.fromJson(json["formats"]),
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
        "formats": formats!.toJson(),
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
