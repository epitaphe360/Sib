import 'dart:convert';

class ResponseOk {
  bool ok;

  ResponseOk({
    required this.ok,
  });

  factory ResponseOk.fromRawJson(String str) =>
      ResponseOk.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseOk.fromJson(Map<String, dynamic> json) => ResponseOk(
        ok: json["ok"],
      );

  Map<String, dynamic> toJson() => {
        "ok": ok,
      };
}
