import 'dart:convert';

class ResponseUpdateProfile {
  int id;
  String username;
  String email;
  String provider;
  bool confirmed;
  bool blocked;
  String name;
  String? phone;
  String? company;
  String? jobPosition;
  String? country;
  String lang;
  DateTime createdAt;
  DateTime updatedAt;
  Role role;

  ResponseUpdateProfile({
    required this.id,
    required this.username,
    required this.email,
    required this.provider,
    required this.confirmed,
    required this.blocked,
    required this.name,
    this.phone,
    this.company,
    this.jobPosition,
    this.country,
    required this.lang,
    required this.createdAt,
    required this.updatedAt,
    required this.role,
  });

  factory ResponseUpdateProfile.fromRawJson(String str) => ResponseUpdateProfile.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory ResponseUpdateProfile.fromJson(Map<String, dynamic> json) => ResponseUpdateProfile(
    id: json["id"],
    username: json["username"],
    email: json["email"],
    provider: json["provider"],
    confirmed: json["confirmed"],
    blocked: json["blocked"],
    name: json["name"],
    phone: json["phone"],
    company: json["company"],
    jobPosition: json["jobPosition"],
    country: json["country"],
    lang: json["lang"],
    createdAt: DateTime.parse(json["createdAt"]),
    updatedAt: DateTime.parse(json["updatedAt"]),
    role: Role.fromJson(json["role"]),
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
    "company": company,
    "jobPosition": jobPosition,
    "country": country,
    "lang": lang,
    "createdAt": createdAt.toIso8601String(),
    "updatedAt": updatedAt.toIso8601String(),
    "role": role.toJson(),
  };
}

class Role {
  int id;
  String name;
  String description;
  String type;
  DateTime createdAt;
  DateTime updatedAt;

  Role({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Role.fromRawJson(String str) => Role.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Role.fromJson(Map<String, dynamic> json) => Role(
    id: json["id"],
    name: json["name"],
    description: json["description"],
    type: json["type"],
    createdAt: DateTime.parse(json["createdAt"]),
    updatedAt: DateTime.parse(json["updatedAt"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "description": description,
    "type": type,
    "createdAt": createdAt.toIso8601String(),
    "updatedAt": updatedAt.toIso8601String(),
  };
}
