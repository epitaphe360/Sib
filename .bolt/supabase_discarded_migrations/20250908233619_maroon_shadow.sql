/*
  # Insert demo data for SIPORTS 2026

  1. Demo Users
    - Admin user
    - Exhibitor users
    - Partner user
    - Visitor user
  2. Demo Exhibitors
    - Port Solutions Inc.
    - Maritime Tech Solutions
    - Global Port Authority
    - EcoPort Technologies
  3. Demo Products
    - Products for each exhibitor
  4. Demo Mini-sites
    - Mini-sites for each exhibitor
  5. Demo News Articles
    - Sample news articles
  6. Demo Events
    - Sample events and conferences
*/

-- Insert demo users
INSERT INTO users (id, email, name, type, profile) VALUES
  ('admin-1', 'admin@siports.com', 'Admin SIPORTS', 'admin', '{"firstName": "Admin", "lastName": "SIPORTS", "company": "SIPORTS Organization", "position": "Administrateur", "country": "Morocco", "bio": "Administrateur de la plateforme SIPORTS 2026"}'),
  ('exhibitor-1', 'exposant@siports.com', 'Sarah Johnson', 'exhibitor', '{"firstName": "Sarah", "lastName": "Johnson", "company": "Port Solutions Inc.", "position": "CEO", "country": "Netherlands", "phone": "", "bio": "Expert en solutions portuaires avec 15+ années d''expérience"}'),
  ('exhibitor-2', 'maritime@siports.com', 'John Smith', 'exhibitor', '{"firstName": "John", "lastName": "Smith", "company": "Maritime Tech Solutions", "position": "CTO", "country": "United Kingdom", "phone": "+44 20 7946 0958", "bio": "Innovateur en équipements portuaires automatisés"}'),
  ('partner-1', 'partenaire@siports.com', 'Ahmed El Mansouri', 'partner', '{"firstName": "Ahmed", "lastName": "El Mansouri", "company": "Autorité Portuaire Casablanca", "position": "Directeur Technique", "country": "Morocco", "phone": "+212 522 123 456", "bio": "Directeur technique avec 20+ ans d''expérience portuaire"}'),
  ('visitor-1', 'visiteur@siports.com', 'Marie Dubois', 'visitor', '{"firstName": "Marie", "lastName": "Dubois", "company": "Maritime Consulting France", "position": "Consultante Senior", "country": "France", "phone": "+33 1 23 45 67 89", "bio": "Consultante en solutions maritimes et logistique portuaire"}')
ON CONFLICT (email) DO NOTHING;

-- Insert demo exhibitors
INSERT INTO exhibitors (id, user_id, company_name, category, sector, description, logo_url, website, verified, featured, contact_info) VALUES
  ('exhibitor-1', 'exhibitor-1', 'Port Solutions Inc.', 'port-operations', 'Port Management', 'Leading provider of integrated port management solutions, specializing in digital transformation and operational efficiency.', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200', 'https://portsolutions.com', true, true, '{"email": "contact@portsolutions.com", "phone": "", "address": "123 Port Avenue", "city": "Amsterdam", "country": "Netherlands"}'),
  ('exhibitor-2', 'exhibitor-2', 'Maritime Tech Solutions', 'port-industry', 'Equipment Manufacturing', 'Innovative manufacturer of port equipment and automation systems for modern maritime facilities.', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200', 'https://maritimetech.com', true, false, '{"email": "contact@maritimetech.com", "phone": "+44 20 7946 0958", "address": "456 Maritime Street", "city": "London", "country": "United Kingdom"}'),
  ('exhibitor-3', 'partner-1', 'Global Port Authority', 'institutional', 'Government', 'International organization promoting sustainable port development and maritime cooperation.', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200', 'https://globalportauthority.org', true, true, '{"email": "contact@globalportauthority.org", "phone": "+1 555 123 4567", "address": "789 International Plaza", "city": "New York", "country": "United States"}')
ON CONFLICT (id) DO NOTHING;

-- Insert demo products
INSERT INTO products (id, exhibitor_id, name, description, category, images, specifications, featured) VALUES
  ('product-1', 'exhibitor-1', 'SmartPort Management System', 'Comprehensive port management platform with real-time analytics and AI-powered insights', 'Software', '{"https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400"}', 'Cloud-based, API integration, Multi-language support, Real-time analytics', true),
  ('product-2', 'exhibitor-1', 'Port Analytics Dashboard', 'Advanced analytics and reporting tools for port performance optimization', 'Analytics', '{"https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400"}', 'Custom dashboards, AI predictions, Data export capabilities', false),
  ('product-3', 'exhibitor-2', 'Automated Crane System', 'Next-generation automated container handling cranes with AI control', 'Equipment', '{"https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400"}', 'Load capacity: 65 tons, Reach: 22 containers, Automation level: Level 4', true),
  ('product-4', 'exhibitor-2', 'Smart Terminal OS', 'Operating system for intelligent terminal management and automation', 'Software', '{"https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400"}', 'Real-time monitoring, Predictive maintenance, Integration APIs', false)
ON CONFLICT (id) DO NOTHING;

-- Insert demo mini-sites
INSERT INTO mini_sites (id, exhibitor_id, theme, custom_colors, published, views) VALUES
  ('minisite-1', 'exhibitor-1', 'modern', '{"primary": "#1e40af", "secondary": "#3b82f6", "accent": "#60a5fa"}', true, 2156),
  ('minisite-2', 'exhibitor-2', 'industrial', '{"primary": "#dc2626", "secondary": "#ef4444", "accent": "#f87171"}', true, 1890),
  ('minisite-3', 'exhibitor-3', 'official', '{"primary": "#059669", "secondary": "#10b981", "accent": "#34d399"}', true, 3100)
ON CONFLICT (id) DO NOTHING;

-- Insert demo news articles
INSERT INTO news_articles (id, title, excerpt, content, author, published_at, category, tags, featured, image, read_time, source) VALUES
  ('news-1', 'SIPORTS 2026 : Un salon international d''envergure mondiale', 'Le Salon International des Ports 2026 s''annonce comme l''événement portuaire de référence avec plus de 330 exposants attendus.', 'Le Salon International des Ports (SIPORTS) 2026 qui se déroulera du 5 au 7 février 2026 à El Jadida, au Maroc, s''annonce comme un événement d''envergure mondiale. Avec plus de 330 exposants confirmés et 6 000 visiteurs professionnels attendus de 40 pays, ce salon constitue une plateforme unique pour l''écosystème portuaire international.', 'Équipe SIPORTS', '2024-01-20 10:00:00', 'Événement', '{"salon", "international", "ports", "maroc"}', true, 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800', 3, 'siports'),
  ('news-2', 'Innovation portuaire : Les technologies qui transforment le secteur', 'Découvrez les innovations technologiques qui révolutionnent les opérations portuaires et la logistique maritime.', 'L''industrie portuaire connaît une transformation technologique sans précédent. De l''intelligence artificielle à l''automatisation, en passant par l''IoT et la blockchain, les ports modernes adoptent des technologies de pointe pour optimiser leurs opérations et améliorer leur compétitivité sur le marché mondial.', 'Dr. Sarah Johnson', '2024-01-18 14:30:00', 'Innovation', '{"technologie", "innovation", "automatisation", "ia"}', true, 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800', 5, 'siports'),
  ('news-3', 'Partenariat stratégique entre ports européens et africains', 'Une nouvelle coopération se dessine entre les ports européens et africains pour renforcer les échanges commerciaux.', 'Les autorités portuaires européennes et africaines renforcent leur coopération dans le cadre d''un partenariat stratégique visant à optimiser les flux commerciaux entre les deux continents. Cette initiative s''inscrit dans une démarche de développement durable et d''efficacité logistique.', 'Ahmed El Mansouri', '2024-01-15 09:15:00', 'Partenariat', '{"partenariat", "europe", "afrique", "cooperation"}', false, 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800', 4, 'siports')
ON CONFLICT (id) DO NOTHING;

-- Insert demo events
INSERT INTO events (id, title, description, type, event_date, start_time, end_time, capacity, registered, category, virtual, featured, location, tags) VALUES
  ('event-1', 'Digitalisation des Ports : Enjeux et Opportunités', 'Table ronde sur les technologies émergentes dans le secteur portuaire et leur impact sur l''efficacité opérationnelle.', 'roundtable', '2026-02-05 14:00:00', '14:00', '15:30', 50, 32, 'Digital Transformation', false, true, 'Salle de conférence A', '{"digitalisation", "innovation", "technologie"}'),
  ('event-2', 'Speed Networking : Opérateurs Portuaires', 'Session de réseautage rapide dédiée aux opérateurs et gestionnaires de terminaux portuaires.', 'networking', '2026-02-06 10:30:00', '10:30', '12:00', 80, 65, 'Networking', false, true, 'Espace networking B', '{"networking", "opérateurs", "partenariats"}'),
  ('event-3', 'Ports Durables : Transition Énergétique', 'Webinaire sur les stratégies de transition énergétique dans les ports et les solutions innovantes.', 'webinar', '2026-02-07 16:00:00', '16:00', '17:00', 200, 145, 'Sustainability', true, false, NULL, '{"durabilité", "énergie", "environnement"}'),
  ('event-4', 'Atelier : Gestion des Données Portuaires', 'Atelier pratique sur l''utilisation des données pour optimiser les opérations portuaires.', 'workshop', '2026-02-06 09:00:00', '09:00', '11:00', 25, 18, 'Data Management', false, false, 'Salle d''atelier C', '{"données", "analytics", "optimisation"}'),
  ('event-5', 'Conférence : L''Avenir du Transport Maritime', 'Conférence magistrale sur les tendances futures du transport maritime et l''impact sur les ports.', 'conference', '2026-02-05 09:00:00', '09:00', '10:00', 300, 280, 'Maritime Transport', false, true, 'Auditorium principal', '{"transport", "maritime", "avenir"}')
ON CONFLICT (id) DO NOTHING;

-- Insert demo time slots
INSERT INTO time_slots (id, exhibitor_id, slot_date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location) VALUES
  ('slot-1', 'exhibitor-1', '2026-02-05', '09:00', '09:30', 30, 'in-person', 1, 0, true, 'Stand A-12'),
  ('slot-2', 'exhibitor-1', '2026-02-05', '10:00', '10:30', 30, 'virtual', 1, 1, false, NULL),
  ('slot-3', 'exhibitor-1', '2026-02-05', '14:00', '14:45', 45, 'hybrid', 2, 1, true, 'Salle de réunion B-5'),
  ('slot-4', 'exhibitor-2', '2026-02-06', '11:00', '11:30', 30, 'in-person', 1, 0, true, 'Stand B-08'),
  ('slot-5', 'exhibitor-2', '2026-02-06', '15:00', '15:30', 30, 'virtual', 1, 0, true, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert demo appointments
INSERT INTO appointments (id, exhibitor_id, visitor_id, time_slot_id, status, message, meeting_type) VALUES
  ('appointment-1', 'exhibitor-1', 'visitor-1', 'slot-2', 'confirmed', 'Intéressé par vos solutions de gestion portuaire', 'virtual'),
  ('appointment-2', 'exhibitor-2', 'visitor-1', 'slot-3', 'pending', 'Souhait de discuter de partenariat technologique', 'hybrid')
ON CONFLICT (id) DO NOTHING;

-- Insert demo conversations
INSERT INTO conversations (id, participants) VALUES
  ('conv-1', '{"visitor-1", "exhibitor-1"}'),
  ('conv-2', '{"visitor-1", "admin-1"}')
ON CONFLICT (id) DO NOTHING;

-- Insert demo messages
INSERT INTO messages (id, conversation_id, sender_id, content, type, read) VALUES
  ('msg-1', 'conv-1', 'exhibitor-1', 'Bonjour, merci pour votre intérêt pour nos solutions portuaires.', 'text', true),
  ('msg-2', 'conv-1', 'visitor-1', 'Je cherche des solutions pour optimiser les opérations de notre port.', 'text', false),
  ('msg-3', 'conv-2', 'admin-1', 'Bienvenue sur SIPORTS 2026 ! Comment puis-je vous aider ?', 'text', true)
ON CONFLICT (id) DO NOTHING;