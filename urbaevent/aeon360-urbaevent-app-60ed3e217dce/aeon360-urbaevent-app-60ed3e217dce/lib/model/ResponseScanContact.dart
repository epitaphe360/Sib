import 'dart:convert';

class ResponseScanContact {
  Data? data;

  ResponseScanContact({
    this.data,
  });

  factory ResponseScanContact.fromRawJson(String str) => ResponseScanContact.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseScanContact.fromJson(Map<String, dynamic> json) => ResponseScanContact(
    data: json["data"] == null ? null : Data.fromJson(json["data"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data?.toJson(),
  };
}

class Data {
  int? id;
  String? typeScanner;
  String? typeScanned;
  DateTime? createdAt;
  DateTime? updatedAt;

  Data({
    this.id,
    this.typeScanner,
    this.typeScanned,
    this.createdAt,
    this.updatedAt,
  });

  factory Data.fromRawJson(String str) => Data.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Data.fromJson(Map<String, dynamic> json) => Data(
    id: json["id"],
    typeScanner: json["typeScanner"],
    typeScanned: json["typeScanned"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "typeScanner": typeScanner,
    "typeScanned": typeScanned,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
  };
}
