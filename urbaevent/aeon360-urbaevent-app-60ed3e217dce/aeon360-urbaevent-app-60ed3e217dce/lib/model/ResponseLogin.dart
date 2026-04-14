import 'dart:convert';

class ResponseAuth {
  String jwt;
  UserDetail user;

  ResponseAuth({
    required this.jwt,
    required this.user,
  });

  factory ResponseAuth.fromRawJson(String str) =>
      ResponseAuth.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseAuth.fromJson(Map<String, dynamic> json) => ResponseAuth(
        jwt: json["jwt"],
        user: UserDetail.fromJson(json["user"]),
      );

  Map<String, dynamic> toJson() => {
        "jwt": jwt,
        "user": user.toJson(),
      };
}

class UserDetail {
  int id;
  String username;
  String email;
  String? provider;
  bool confirmed;
  bool blocked;
  String name;
  String? phone;
  String? socialId;
  String? company;
  String? jobPosition;
  String? country;
  String lang;
  DateTime createdAt;
  DateTime updatedAt;
  bool? emailOTPConfirmed;

  UserDetail(
      {required this.id,
      required this.username,
      required this.email,
      this.provider,
      required this.confirmed,
      required this.blocked,
      required this.name,
      this.phone,
      this.socialId,
      this.company,
      this.jobPosition,
      this.country,
      required this.lang,
      required this.createdAt,
      required this.updatedAt,
      this.emailOTPConfirmed});

  factory UserDetail.fromRawJson(String str) =>
      UserDetail.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory UserDetail.fromJson(Map<String, dynamic> json) => UserDetail(
        id: json["id"],
        username: json["username"],
        email: json["email"],
        provider: json["provider"],
        confirmed: json["confirmed"],
        blocked: json["blocked"],
        name: json["name"],
        phone: json["phone"],
        socialId: json["socialId"],
        company: json["company"],
        jobPosition: json["jobPosition"],
        country: json["country"],
        lang: json["lang"],
        createdAt: DateTime.parse(json["createdAt"]),
        updatedAt: DateTime.parse(json["updatedAt"]),
        emailOTPConfirmed: json["emailOTPConfirmed"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "username": username,
        "email": email,
        "provider": provider,
        "confirmed": confirmed,
        "blocked": blocked,
        "name": name,
        "phone": phone,
        "socialId": socialId,
        "company": company,
        "jobPosition": jobPosition,
        "country": country,
        "lang": lang,
        "createdAt": createdAt.toIso8601String(),
        "updatedAt": updatedAt.toIso8601String(),
    "emailOTPConfirmed": emailOTPConfirmed,
      };
}
