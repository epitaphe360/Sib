import 'dart:convert';

class ResponseConferenceIds {
  List<DataId>? data;
  Meta? meta;

  ResponseConferenceIds({
    this.data,
    this.meta,
  });

  factory ResponseConferenceIds.fromRawJson(String str) => ResponseConferenceIds.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseConferenceIds.fromJson(Map<String, dynamic> json) => ResponseConferenceIds(
    data: json["data"] == null ? [] : List<DataId>.from(json["data"]!.map((x) => DataId.fromJson(x))),
    meta: json["meta"] == null ? null : Meta.fromJson(json["meta"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data == null ? [] : List<dynamic>.from(data!.map((x) => x.toJson())),
    "meta": meta?.toJson(),
  };
}

class DataId {
  int? id;

  DataId({
    this.id,
  });

  factory DataId.fromRawJson(String str) => DataId.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory DataId.fromJson(Map<String, dynamic> json) => DataId(
    id: json["id"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
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
