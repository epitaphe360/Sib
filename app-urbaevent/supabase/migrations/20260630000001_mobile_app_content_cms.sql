-- CMS contenu application mobile UrbaEvent (APK) — lecture publique via RPC

CREATE OR REPLACE FUNCTION public.get_mobile_app_content()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
STABLE
AS $$
  SELECT COALESCE(
    (SELECT value::jsonb FROM public.app_settings WHERE key = 'mobile_app_content_v1' LIMIT 1),
    '{}'::jsonb
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_mobile_app_content() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_mobile_app_content() TO anon;

COMMENT ON FUNCTION public.get_mobile_app_content IS
  'Contenu éditable APK (hero, stats, images, paiement) — admin dashboard section Mobile';

INSERT INTO public.app_settings (key, value, updated_at)
VALUES (
  'mobile_app_content_v1',
  '{
    "version": 1,
    "updatedAt": "2026-06-30T00:00:00Z",
    "hero": {
      "badgeOrg": "URBACOM",
      "titlePart1": "Urba",
      "titlePart2": "Event",
      "subtitleFr": "La plateforme officielle des salons UrbaEvent",
      "subtitleEn": "The official UrbaEvent trade shows platform",
      "subtitleAr": "المنصة الرسمية لمعارض UrbaEvent"
    },
    "platformStats": [
      { "value": "5", "labelKey": "home.urba.statSalons" },
      { "value": "500+", "labelKey": "home.urba.statExhibitors" },
      { "value": "25K+", "labelKey": "home.urba.statVisitors" },
      { "value": "40+", "labelKey": "home.urba.statCountries" }
    ],
    "images": {},
    "payment": { "vipPriceEur": 700, "currency": "EUR" },
    "salonStats": { "sib": { "visitors": "200 000+", "edition": "20ème édition" } }
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO NOTHING;
