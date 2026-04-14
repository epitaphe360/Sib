import 'dart:convert';

class ResponseGateList {
  List<GateItem>? data;
  Meta? meta;

  ResponseGateList({
    this.data,
    this.meta,
  });

  factory ResponseGateList.fromRawJson(String str) => ResponseGateList.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseGateList.fromJson(Map<String, dynamic> json) => ResponseGateList(
    data: json["data"] == null ? [] : List<GateItem>.from(json["data"]!.map((x) => GateItem.fromJson(x))),
    meta: json["meta"] == null ? null : Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data == null ? [] : List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class GateItem {
  int? id;
  String? name;
  DateTime? createdAt;
  DateTime? updatedAt;

  GateItem({
    this.id,
    this.name,
    this.createdAt,
    this.updatedAt,
  });

  factory GateItem.fromRawJson(String str) => GateItem.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory GateItem.fromJson(Map<String, dynamic> json) => GateItem(
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
