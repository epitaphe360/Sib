import 'dart:convert';

class AssociateInfo {
  int? id;
  String? username;
  String? email;
  dynamic emailOtp;
  String? provider;
  bool? confirmed;
  bool? blocked;
  String? name;
  String? phone;
  dynamic company;
  String? jobPosition;
  dynamic country;
  String? lang;
  DateTime? createdAt;
  DateTime? updatedAt;
  List<Registration>? registrations;

  AssociateInfo({
    this.id,
    this.username,
    this.email,
    this.emailOtp,
    this.provider,
    this.confirmed,
    this.blocked,
    this.name,
    this.phone,
    this.company,
    this.jobPosition,
    this.country,
    this.lang,
    this.createdAt,
    this.updatedAt,
    this.registrations,
  });

  factory AssociateInfo.fromRawJson(String str) => AssociateInfo.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory AssociateInfo.fromJson(Map<String, dynamic> json) => AssociateInfo(
    id: json["id"],
    username: json["username"],
    email: json["email"],
    emailOtp: json["emailOTP"],
    provider: json["provider"],
    confirmed: json["confirmed"],
    blocked: json["blocked"],
    name: json["name"],
    phone: json["phone"],
    company: json["company"],
    jobPosition: json["jobPosition"],
    country: json["country"],
    lang: json["lang"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
    registrations: json["registrations"] == null ? [] : List<Registration>.from(json["registrations"]!.map((x) => Registration.fromJson(x))),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "username": username,
    "email": email,
    "emailOTP": emailOtp,
    "provider": provider,
    "confirmed": confirmed,
    "blocked": blocked,
    "name": name,
    "phone": phone,
    "company": company,
    "jobPosition": jobPosition,
    "country": country,
    "lang": lang,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
    "registrations": registrations == null ? [] : List<dynamic>.from(registrations!.map((x) => x.toJson())),
  };
}


class Registration {
  int? id;
  dynamic booth;
  String? type;
  bool? confirmed;
  DateTime? createdAt;
  DateTime? updatedAt;
  dynamic emailBadgeSent;
  dynamic message;

  Registration({
    this.id,
    this.booth,
    this.type,
    this.confirmed,
    this.createdAt,
    this.updatedAt,
    this.emailBadgeSent,
    this.message,
  });

  factory Registration.fromRawJson(String str) => Registration.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Registration.fromJson(Map<String, dynamic> json) => Registration(
    id: json["id"],
    booth: json["booth"],
    type: json["type"],
    confirmed: json["confirmed"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
    emailBadgeSent: json["emailBadgeSent"],
    message: json["message"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "booth": booth,
    "type": type,
    "confirmed": confirmed,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
    "emailBadgeSent": emailBadgeSent,
    "message": message,
  };
}
