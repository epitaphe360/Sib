import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/control_zone.dart';

class ZoneService {
  static final _client = Supabase.instance.client;

  /// Charge les zones depuis Supabase (définies par l'administrateur)
  static Future<List<ControlZone>> getZones() async {
    final response = await _client
        .from('control_zones')
        .select('id, name, icon, description')
        .order('created_at');

    return (response as List<dynamic>)
        .map((e) => ControlZone.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
