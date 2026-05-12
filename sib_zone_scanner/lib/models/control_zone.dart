class ControlZone {
  final String id;
  final String name;
  final String icon;
  final String description;

  const ControlZone({
    required this.id,
    required this.name,
    required this.icon,
    required this.description,
  });

  factory ControlZone.fromJson(Map<String, dynamic> json) => ControlZone(
        id: json['id'] as String,
        name: json['name'] as String,
        icon: json['icon'] as String? ?? '📍',
        description: json['description'] as String? ?? '',
      );
}
