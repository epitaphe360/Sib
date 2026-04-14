import 'dart:convert';

class ResponseEventRegistration {
  Data? data;
  Meta? meta;

  ResponseEventRegistration({
    this.data,
    this.meta,
  });

  factory ResponseEventRegistration.fromRawJson(String str) => ResponseEventRegistration.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseEventRegistration.fromJson(Map<String, dynamic> json) => ResponseEventRegistration(
    data: json["data"] == null ? null : Data.fromJson(json["data"]),
    meta: json["meta"] == null ? null : Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data?.toJson(),
    "meta": meta?.toJson(),
  };
}

class Data {
  int? id;
  dynamic booth;
  String? type;
  bool? confirmed;
  DateTime? createdAt;
  DateTime? updatedAt;

  Data({
    this.id,
    this.booth,
    this.type,
    this.confirmed,
    this.createdAt,
    this.updatedAt,
  });

  factory Data.fromRawJson(String str) => Data.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Data.fromJson(Map<String, dynamic> json) => Data(
    id: json["id"],
    booth: json["booth"],
    type: json["type"],
    confirmed: json["confirmed"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "booth": booth,
    "type": type,
    "confirmed": confirmed,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
  };
}

class Meta {
  Meta();

  factory Meta.fromRawJson(String str) => Meta.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Meta.fromJson(Map<String, dynamic> json) => Meta(
  );

  Map<String, dynamic> toJson() => {
  };
}
