-- ================================================================
-- SIB 2026 — SEED DÉMO COMPLET (version finale robuste)
--
-- ⚠️  ÉTAPE 1 (faire EN PREMIER dans un nouvel onglet SQL Editor) :
--     ALTER TYPE exhibitor_category ADD VALUE IF NOT EXISTS 'construction';
--     ALTER TYPE exhibitor_category ADD VALUE IF NOT EXISTS 'materials';
--     ALTER TYPE exhibitor_category ADD VALUE IF NOT EXISTS 'equipment';
--     ALTER TYPE exhibitor_category ADD VALUE IF NOT EXISTS 'services';
--     ALTER TYPE exhibitor_category ADD VALUE IF NOT EXISTS 'decoration';
--     → Cliquer RUN → attendre "Success"
--
-- ⚠️  ÉTAPE 2 : exécuter CE fichier dans un nouvel onglet.
--
-- Comptes OBLIGATOIRES : visiteur@sib.com, exposant@sib.com, partenaire@sib.com
-- Comptes OPTIONNELS   : admin.sib@sib.com, securite@sib.com
-- ================================================================

-- ================================================================
-- PARTIE 1 — DDL hors transaction (CREATE TABLE + contraintes)
-- ================================================================

ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_status_check;
ALTER TABLE public.certificates
  ADD CONSTRAINT certificates_status_check
  CHECK (status IN ('valid', 'revoked', 'issued'));

CREATE TABLE IF NOT EXISTS public.speed_networking_participants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.speed_networking_sessions(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status     text NOT NULL DEFAULT 'registered',
  joined_at  timestamptz DEFAULT now(),
  UNIQUE (session_id, user_id)
);
ALTER TABLE public.speed_networking_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS snp_own_read   ON public.speed_networking_participants;
DROP POLICY IF EXISTS snp_own_insert ON public.speed_networking_participants;
CREATE POLICY snp_own_read   ON public.speed_networking_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY snp_own_insert ON public.speed_networking_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.badge_replacements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  old_badge_code text,
  new_badge_code text,
  reason         text,
  replaced_by    uuid REFERENCES public.users(id),
  created_at     timestamptz DEFAULT now()
);
ALTER TABLE public.badge_replacements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS br_sc_all ON public.badge_replacements;
CREATE POLICY br_sc_all ON public.badge_replacements FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type IN ('admin','service_client')));

-- ================================================================
-- PARTIE 2 — Seed données
-- ================================================================
DO $$
DECLARE
  v_visitor_id    UUID;
  v_exhibitor_id  UUID;
  v_partner_id    UUID;
  v_admin_id      UUID;
  v_security_id   UUID;
  v_exhibitor_row UUID;
  v_slot1 UUID; v_slot2 UUID; v_slot3 UUID; v_slot4 UUID;
  v_conv1 UUID; v_conv2 UUID;
  v_ev1 UUID; v_ev2 UUID; v_ev3 UUID; v_ev4 UUID;
  v_ev5 UUID; v_ev6 UUID; v_ev7 UUID; v_ev8 UUID;
BEGIN

-- ----------------------------------------------------------------
-- 0. Récupérer les UUID (comptes obligatoires + optionnels)
-- ----------------------------------------------------------------
SELECT id INTO v_visitor_id   FROM auth.users WHERE email = 'visiteur@sib.com'    LIMIT 1;
SELECT id INTO v_exhibitor_id FROM auth.users WHERE email = 'exposant@sib.com'    LIMIT 1;
SELECT id INTO v_partner_id   FROM auth.users WHERE email = 'partenaire@sib.com'  LIMIT 1;
SELECT id INTO v_admin_id     FROM auth.users WHERE email = 'admin.sib@sib.com'   LIMIT 1;
SELECT id INTO v_security_id  FROM auth.users WHERE email = 'securite@sib.com'    LIMIT 1;

-- Comptes obligatoires
IF v_visitor_id   IS NULL THEN RAISE EXCEPTION 'visiteur@sib.com introuvable';   END IF;
IF v_exhibitor_id IS NULL THEN RAISE EXCEPTION 'exposant@sib.com introuvable';   END IF;
IF v_partner_id   IS NULL THEN RAISE EXCEPTION 'partenaire@sib.com introuvable'; END IF;

-- ----------------------------------------------------------------
-- 5. EXHIBITOR — BatiTech Maroc pour exposant@sib.com
-- ----------------------------------------------------------------
IF EXISTS (SELECT 1 FROM public.exhibitors WHERE user_id = v_exhibitor_id) THEN
  UPDATE public.exhibitors SET
    company_name = 'BatiTech Maroc',
    category     = 'materials',
    sector       = 'Bâtiment & Travaux Publics',
    description  = 'Spécialiste en solutions innovantes pour la construction durable. Nos produits couvrent l''isolation thermique, les revêtements écologiques et les systèmes de façades ventilées.',
    stand_number = 'A-12',
    hall_number  = 'Hall 1',
    is_published = true,
    verified     = true,
    featured     = true
  WHERE user_id = v_exhibitor_id;
ELSE
  INSERT INTO public.exhibitors (user_id, company_name, category, sector, description,
    stand_number, hall_number, is_published, verified, featured)
  VALUES (
    v_exhibitor_id, 'BatiTech Maroc', 'materials', 'Bâtiment & Travaux Publics',
    'Spécialiste en solutions innovantes pour la construction durable. Nos produits couvrent l''isolation thermique, les revêtements écologiques et les systèmes de façades ventilées.',
    'A-12', 'Hall 1', true, true, true
  );
END IF;

SELECT id INTO v_exhibitor_row FROM public.exhibitors WHERE user_id = v_exhibitor_id;

-- ----------------------------------------------------------------
-- 6. PARTNER (optionnel si user_id existe dans la table)
-- ----------------------------------------------------------------
IF EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema='public' AND table_name='partners' AND column_name='user_id'
) AND NOT EXISTS (
  SELECT 1 FROM public.partners WHERE user_id = v_partner_id
) THEN
  INSERT INTO public.partners (user_id, company_name, sector, description, verified)
  VALUES (v_partner_id,'Urbacom Partenaires','Urbanisme & Architecture',
    'Partenaire institutionnel du SIB 2026.',true);
END IF;

-- ----------------------------------------------------------------
-- 7. USER_BADGES — upsert via ON CONFLICT (user_id)
--    Seuls les utilisateurs dont on a l'UUID sont insérés.
-- ----------------------------------------------------------------
INSERT INTO public.user_badges (
  user_id, badge_code, user_type, user_level, full_name, company_name,
  position, email, access_level, valid_from, valid_until, status, qr_data
)
SELECT * FROM (VALUES
  (v_visitor_id,  'VIS-2026-001','visitor', 'free',
   'Youssef Alami',     NULL::text,           'Ingénieur BTP',          'visiteur@sib.com',
   'general',  now(), now()+interval'5 days','active',
   json_build_object('type','visitor',  'code','VIS-2026-001','user_id',v_visitor_id)),

  (v_exhibitor_id,'EXP-2026-001','exhibitor','free',
   'Hassan Benjelloun', 'BatiTech Maroc',     'Directeur Commercial',   'exposant@sib.com',
   'exhibitor',now(), now()+interval'5 days','active',
   json_build_object('type','exhibitor','code','EXP-2026-001','user_id',v_exhibitor_id)),

  (v_partner_id,  'PAR-2026-001','partner',  'free',
   'Nadia Berrada',    'Urbacom Partenaires','Responsable Partenariats','partenaire@sib.com',
   'partner',  now(), now()+interval'5 days','active',
   json_build_object('type','partner', 'code','PAR-2026-001','user_id',v_partner_id)),

  (v_admin_id,    'ADM-2026-001','admin',    'free',
   'Admin SIB',        NULL::text,           'Organisateur',            'admin.sib@sib.com',
   'full',     now(), now()+interval'5 days','active',
   json_build_object('type','admin',   'code','ADM-2026-001','user_id',v_admin_id)),

  (v_security_id, 'SEC-2026-001','security', 'free',
   'Agent Sécurité',   NULL::text,           'Responsable Accès',       'securite@sib.com',
   'security', now(), now()+interval'5 days','active',
   json_build_object('type','security','code','SEC-2026-001','user_id',v_security_id))
) AS t(user_id, badge_code, user_type, user_level, full_name, company_name,
       position, email, access_level, valid_from, valid_until, status, qr_data)
WHERE t.user_id IS NOT NULL   -- ignore les comptes optionnels absents
ON CONFLICT (user_id) DO UPDATE SET
  badge_code  = EXCLUDED.badge_code,
  user_type   = EXCLUDED.user_type,
  full_name   = EXCLUDED.full_name,
  status      = EXCLUDED.status,
  valid_until = EXCLUDED.valid_until,
  qr_data     = EXCLUDED.qr_data;

-- ----------------------------------------------------------------
-- 8. EVENTS — programme du salon (8 conférences/ateliers BTP)
-- ----------------------------------------------------------------
v_ev1:=gen_random_uuid(); v_ev2:=gen_random_uuid();
v_ev3:=gen_random_uuid(); v_ev4:=gen_random_uuid();
v_ev5:=gen_random_uuid(); v_ev6:=gen_random_uuid();
v_ev7:=gen_random_uuid(); v_ev8:=gen_random_uuid();

INSERT INTO public.events (id, title, description, event_type, start_date, end_date,
  location, capacity, registered, is_featured, speaker_name, speaker_title)
VALUES
  (v_ev1,'Conférence d''ouverture — L''avenir du bâtiment durable au Maroc',
   'Intervention des acteurs institutionnels sur la feuille de route nationale. Plan Maroc Vert Bâtiment 2030.',
   'conference',now()+interval'1 day 9 hours',now()+interval'1 day 11 hours',
   'Hall 1 — Auditorium',500,312,true,'Prof. Karim Mansouri','Directeur MPEP'),

  (v_ev2,'Atelier : BIM pour la rénovation énergétique',
   'Session pratique sur l''utilisation du BIM pour planifier la rénovation énergétique de bâtiments existants.',
   'workshop',now()+interval'1 day 14 hours',now()+interval'1 day 17 hours',
   'Salle de workshops A',50,38,false,'Ingrid Lefebvre','Architecte BIM — ARCHI360'),

  (v_ev3,'Table ronde : Financement de l''immobilier social',
   'Débat sur les nouveaux mécanismes de financement du logement social et les perspectives du Fonds Mohammed VI.',
   'conference',now()+interval'2 days 10 hours',now()+interval'2 days 12 hours',
   'Hall 2 — Salle A',200,145,true,NULL,NULL),

  (v_ev4,'Networking B2B — Exposants & Partenaires',
   'Speed networking réservé aux exposants et partenaires. Rencontres de 5 minutes.',
   'networking',now()+interval'2 days 15 hours',now()+interval'2 days 17 hours',
   'Espace Networking — Allée centrale',80,62,false,NULL,NULL),

  (v_ev5,'Conférence : Matériaux biosourcés et économie circulaire',
   'Innovations en matériaux biosourcés (chanvre, liège, bois local) et économie circulaire en BTP.',
   'conference',now()+interval'3 days 9 hours',now()+interval'3 days 11 hours',
   'Hall 3 — Amphithéâtre',300,211,true,'Dr. Lalla F.Z. El Mansouri','Chercheuse CNRST'),

  (v_ev6,'Atelier : Réglementation thermique RTCM',
   'Décryptage de la RTCM et retours d''expérience. Conception bioclimatique.',
   'workshop',now()+interval'3 days 14 hours',now()+interval'3 days 16 hours',
   'Salle de workshops B',40,27,false,'Mehdi Cherkaoui','Ingénieur thermicien — QUALIBAT'),

  (v_ev7,'Panel : Smart Building et villes intelligentes',
   'Bâtiments intelligents au Maroc et dans la région MENA. Domotique, GTC et jumeaux numériques.',
   'conference',now()+interval'4 days 10 hours',now()+interval'4 days 12 hours',
   'Hall 1 — Auditorium',400,178,false,NULL,NULL),

  (v_ev8,'Cérémonie de clôture & remise des prix du Bâtiment Durable',
   'Trophées SIB 2026. Récapitulatif des 5 jours. Cocktail de clôture pour tous les participants.',
   'conference',now()+interval'5 days 17 hours',now()+interval'5 days 19 hours',
   'Hall 1 — Auditorium',600,350,true,NULL,NULL)

ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- 9. TIME SLOTS — créneaux RDV pour l'exposant
-- ----------------------------------------------------------------
v_slot1:=gen_random_uuid(); v_slot2:=gen_random_uuid();
v_slot3:=gen_random_uuid(); v_slot4:=gen_random_uuid();

INSERT INTO public.time_slots (id, exhibitor_id, slot_date, start_time, end_time,
  duration, type, max_bookings, current_bookings, available, location)
VALUES
  (v_slot1,v_exhibitor_row,(current_date+1)::date,'09:00','09:30',30,'in-person',2,1,true,'Stand A-12 — Hall 1'),
  (v_slot2,v_exhibitor_row,(current_date+1)::date,'10:00','10:30',30,'in-person',2,0,true,'Stand A-12 — Hall 1'),
  (v_slot3,v_exhibitor_row,(current_date+2)::date,'14:00','14:30',30,'in-person',2,0,true,'Stand A-12 — Hall 1'),
  (v_slot4,v_exhibitor_row,(current_date+2)::date,'15:30','16:00',30,'virtual',  1,1,false,'Visioconférence')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- 10. APPOINTMENTS — RDV visiteur ↔ exposant
-- ----------------------------------------------------------------
INSERT INTO public.appointments (exhibitor_id, visitor_id, time_slot_id, status, message, meeting_type)
VALUES
  (v_exhibitor_row,v_visitor_id,v_slot1,'confirmed',
   'Intéressé par vos solutions d''isolation thermique pour un projet résidentiel à Casablanca.','in-person'),
  (v_exhibitor_row,v_partner_id,v_slot4,'pending',
   'Souhaitons discuter d''un partenariat pour la promotion des matériaux biosourcés.','virtual')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 11. PAYMENT_REQUESTS — demandes VIP en attente
-- ----------------------------------------------------------------
-- requested_level CHECK = ('premium','silver','gold','platinium','museum')
INSERT INTO public.payment_requests (user_id, requested_level, amount, status)
VALUES
  (v_visitor_id,'premium', 1200.00,'pending'),
  (v_partner_id,'gold',    2500.00,'pending'),
  (v_visitor_id,'platinium',3500.00,'pending')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 12. REGISTRATION_REQUESTS — alertes inscriptions (staff)
-- ----------------------------------------------------------------
INSERT INTO public.registration_requests (
  user_id, user_type, email, first_name, last_name,
  company_name, position, phone, status
)
VALUES
  (v_visitor_id, 'visitor',  'visiteur@sib.com',
   'Youssef','Alami',         NULL,                'Ingénieur BTP',           '+212600112233','pending'),
  (v_exhibitor_id,'exhibitor','exposant@sib.com',
   'Hassan', 'Benjelloun',    'BatiTech Maroc',    'Directeur Commercial',    '+212655443322','pending'),
  (v_partner_id,  'partner',  'partenaire@sib.com',
   'Nadia',  'Berrada',       'Urbacom Partenaires','Responsable Partenariats','+212677889900','pending')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 13. ACCESS_LOGS — scans accordés → certificat visiteur activé
-- ----------------------------------------------------------------
-- v_security_id peut être NULL → on utilise v_admin_id en fallback
INSERT INTO public.access_logs (
  user_id, user_name, user_type, zone, event, entrance_point, status, scanned_by, accessed_at
)
VALUES
  (v_visitor_id,'Youssef Alami','visitor','hall-1','SIB 2026',
   'Entrée principale','granted',
   COALESCE(v_security_id, v_admin_id, v_visitor_id),
   now()-interval'2 hours'),
  (v_visitor_id,'Youssef Alami','visitor','espace-conferences','SIB 2026',
   'Accès Auditorium','granted',
   COALESCE(v_security_id, v_admin_id, v_visitor_id),
   now()-interval'1 hour')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 14. SPEED NETWORKING SESSIONS
-- ----------------------------------------------------------------
INSERT INTO public.speed_networking_sessions (
  name, description, start_time, duration, max_participants, participants, status
)
VALUES
  ('Session B2B Exposants — Matinée',
   'Speed networking exposants & visiteurs pro. Rencontres de 5 min, max 20 participants.',
   now()+interval'1 day 9 hours',90,20,'[]'::jsonb,'scheduled'),
  ('Session Open Networking — Après-midi',
   'Session ouverte à tous les participants SIB 2026. Élargissez votre réseau BTP.',
   now()+interval'2 days 14 hours',120,30,'[]'::jsonb,'scheduled')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 15. CONNECTIONS — réseau de contacts
-- ----------------------------------------------------------------
INSERT INTO public.connections (requester_id, addressee_id, status, message)
VALUES
  (v_visitor_id,  v_exhibitor_id,'accepted','Rencontré au SIB 2026 — intéressé par vos produits d''isolation'),
  (v_visitor_id,  v_partner_id,  'pending', 'Bonjour, j''aimerais discuter de votre programme de partenariat'),
  (v_exhibitor_id,v_partner_id,  'accepted','Partenariat potentiel pour la promotion des matériaux biosourcés')
ON CONFLICT (requester_id, addressee_id) DO NOTHING;

-- ----------------------------------------------------------------
-- 16. CONVERSATIONS + MESSAGES
-- ----------------------------------------------------------------
v_conv1:=gen_random_uuid(); v_conv2:=gen_random_uuid();

INSERT INTO public.conversations (id, type, participants, created_by, last_message_at, is_active)
VALUES
  (v_conv1,'direct',ARRAY[v_visitor_id, v_exhibitor_id],v_visitor_id,  now()-interval'30 minutes',true),
  (v_conv2,'direct',ARRAY[v_exhibitor_id,v_partner_id], v_exhibitor_id,now()-interval'1 hour',    true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.messages (conversation_id, sender_id, receiver_id, content, message_type, read_at)
VALUES
  (v_conv1,v_visitor_id,  v_exhibitor_id,
   'Bonjour, j''ai visité votre stand au Hall 1. Dispo pour une démo de vos panneaux isolants ce soir ?',
   'text',NULL),
  (v_conv1,v_exhibitor_id,v_visitor_id,
   'Bonjour ! Disponible de 16h à 18h au stand A-12. À tout à l''heure.',
   'text',now()-interval'25 minutes'),
  (v_conv1,v_visitor_id,  v_exhibitor_id,
   'Parfait ! Nous avons un projet de 80 logements à Rabat.',
   'text',NULL),
  (v_conv2,v_exhibitor_id,v_partner_id,
   'Bonsoir, notre stand présente des solutions en matériaux biosourcés. Un partenariat serait-il envisageable ?',
   'text',NULL),
  (v_conv2,v_partner_id,  v_exhibitor_id,
   'Bonsoir ! Certainement. Programme de labellisation en cours — passez nous voir demain matin.',
   'text',now()-interval'55 minutes')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 17. EXHIBITOR_LEADS — scans QR
-- ----------------------------------------------------------------
INSERT INTO public.exhibitor_leads (exhibitor_user_id, visitor_user_id, scanned_at)
VALUES
  (v_exhibitor_id,v_visitor_id,now()-interval'3 hours'),
  (v_exhibitor_id,v_partner_id,now()-interval'2 hours')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 18. NEWS_ARTICLES
-- ----------------------------------------------------------------
INSERT INTO public.news_articles (title, content, excerpt, category, published, published_at, author_id)
VALUES
  ('SIB 2026 : 500 exposants de 30 pays attendus à El Jadida',
   'Le Salon International du Bâtiment 2026 ouvrira ses portes du 15 au 19 octobre au Parc Mohammed VI d''El Jadida. 500 exposants, 30 pays, accent sur la construction durable.',
   'Le SIB 2026 s''annonce comme le plus grand salon BTP du Maroc.',
   'événement',true,now()-interval'5 days',v_admin_id),
  ('Nouveau programme de labellisation Bâtiment Durable Maroc',
   'Le ministère de l''Habitat lance un programme de labellisation pour les constructions durables. Entrée en vigueur le 1er janvier 2027.',
   'Le Maroc franchit une étape vers la construction écologique.',
   'réglementation',true,now()-interval'3 days',v_admin_id),
  ('BatiTech Maroc remporte le Trophée Innovation SIB 2025',
   'BatiTech Maroc a remporté le Trophée de l''Innovation pour son système d''isolation thermique à base de paille de blé — réduction de 40% de la consommation énergétique.',
   'Innovation locale récompensée dans la construction.',
   'prix',true,now()-interval'1 day',v_admin_id)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 19. NOTIFICATIONS pour le visiteur
-- ----------------------------------------------------------------
-- La colonne s'appelle is_read depuis la migration 20260102000001
INSERT INTO public.notifications (user_id, title, message, type, is_read)
VALUES
  (v_visitor_id,'RDV confirmé — BatiTech Maroc',
   'Votre rendez-vous au stand A-12 est confirmé pour demain à 9h00.','appointment',false),
  (v_visitor_id,'Nouvelle connexion acceptée',
   'Hassan Benjelloun (BatiTech Maroc) a accepté votre demande.','connection',false),
  (v_visitor_id,'Session Speed Networking disponible',
   'La session B2B Exposants est ouverte aux inscriptions.','event',true)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- 20. VISITOR_LEVELS (CHECK = 'free'|'premium'|'vip')
-- ----------------------------------------------------------------
INSERT INTO public.visitor_levels (level, name, price_annual, price_monthly, features)
VALUES
  ('free',   'Gratuit', 0,    0,   '["Programme","Networking de base","Chat"]'::jsonb),
  ('premium','Premium', 1200, 120, '["Programme VIP","Networking illimite","Chat","Speed networking","Certificat"]'::jsonb),
  ('vip',    'VIP',     2500, 250, '["Programme VIP","Networking illimite","Chat","Speed networking","Certificat","Acces lounge","Badge gold"]'::jsonb)
ON CONFLICT (level) DO UPDATE SET
  price_annual  = EXCLUDED.price_annual,
  price_monthly = EXCLUDED.price_monthly,
  features      = EXCLUDED.features;

-- ----------------------------------------------------------------
-- 21. APP_SETTINGS — badge_config_v1
-- ----------------------------------------------------------------
INSERT INTO public.app_settings (key, value)
VALUES ('badge_config_v1', '{
  "visitorColor":       "#1B365D",
  "exhibitorColor":     "#C47B1A",
  "partnerColor":       "#0D5C3E",
  "adminColor":         "#6B21A8",
  "securityColor":      "#991B1B",
  "serviceClientColor": "#0E7490",
  "salonName":          "SIB 2026",
  "salonDates":         "15 – 19 oct. 2026",
  "salonLocation":      "El Jadida, Maroc",
  "logoUrl":            null
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ----------------------------------------------------------------
-- 22. RÉSUMÉ
-- ----------------------------------------------------------------
RAISE NOTICE '✅ Seed SIB 2026 terminé avec succès';
RAISE NOTICE '   Exposant  : BatiTech Maroc — Stand A-12 Hall 1';
RAISE NOTICE '   Events    : 8  |  Slots : 4  |  RDV : 2';
RAISE NOTICE '   Payments  : 3 en attente  |  Alerts : 3 en attente';
RAISE NOTICE '   Logs      : 2 (certificat visiteur activé)';
RAISE NOTICE '   Sessions  : 2 speed networking planifiées';
RAISE NOTICE '   Réseau    : 3 connexions | 2 conv. | 5 messages';

END $$;
