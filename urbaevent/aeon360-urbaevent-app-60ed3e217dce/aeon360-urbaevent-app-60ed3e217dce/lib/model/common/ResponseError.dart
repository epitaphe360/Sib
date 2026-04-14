import 'dart:convert';

class ResponseError {
  dynamic data;
  Error error;

  ResponseError({
    required this.data,
    required this.error,
  });

  factory ResponseError.fromRawJson(String str) => ResponseError.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseError.fromJson(Map<String, dynamic> json) => ResponseError(
    data: json["data"],
    error: Error.fromJson(json["error"]),
  );

  Map<String, dynamic> toJson() => {
    "data": data,
    "error": error.toJson(),
  };
}

class Error {
  int status;
  String name;
  String message;
  Details details;

  Error({
    required this.status,
    required this.name,
    required this.message,
    required this.details,
  });

  factory Error.fromRawJson(String str) => Error.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Error.fromJson(Map<String, dynamic> json) => Error(
    status: json["status"],
    name: json["name"],
    message: json["message"],
    details: Details.fromJson(json["details"]),
  );

  Map<String, dynamic> toJson() => {
    "status": status,
    "name": name,
    "message": message,
    "details": details.toJson(),
  };
}

class Details {
  Details();

  factory Details.fromRawJson(String str) => Details.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Details.fromJson(Map<String, dynamic> json) => Details(
  );

  Map<String, dynamic> toJson() => {
  };
}
