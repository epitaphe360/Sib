import 'dart:convert';

class ResponseAppleData {
  Data? data;
  Meta? meta;

  ResponseAppleData({
    this.data,
    this.meta,
  });

  factory ResponseAppleData.fromRawJson(String str) => ResponseAppleData.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseAppleData.fromJson(Map<String, dynamic> json) => ResponseAppleData(
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
  String? firstName;
  String? lastName;
  String? email;
  String? socialId;
  DateTime? createdAt;
  DateTime? updatedAt;

  Data({
    this.id,
    this.firstName,
    this.lastName,
    this.email,
    this.socialId,
    this.createdAt,
    this.updatedAt,
  });

  factory Data.fromRawJson(String str) => Data.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Data.fromJson(Map<String, dynamic> json) => Data(
    id: json["id"],
    firstName: json["firstName"],
    lastName: json["lastName"],
    email: json["email"],
    socialId: json["socialId"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "firstName": firstName,
    "lastName": lastName,
    "email": email,
    "socialId": socialId,
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
