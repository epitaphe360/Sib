-- Migration: Create Exhibitors and Partners from existing users
-- Date: 2025-12-25

-- First, delete any existing data to avoid duplicates
DELETE FROM public.exhibitors WHERE user_id IN (
  SELECT id FROM public.users WHERE type = 'exhibitor' AND email LIKE '%@test.siport.com'
);

DELETE FROM public.partners WHERE user_id IN (
  SELECT id FROM public.users WHERE type = 'partner' AND email LIKE '%@test.siport.com'
);

-- Create exhibitors from users with type='exhibitor'
INSERT INTO public.exhibitors (user_id, company_name, category, sector, description, contact_info, created_at, updated_at)
SELECT 
  u.id,
  u.name,
  CASE 
    WHEN u.email LIKE '%-54m%' THEN 'port-industry'::exhibitor_category
    WHEN u.email LIKE '%-36m%' THEN 'port-operations'::exhibitor_category
    WHEN u.email LIKE '%-18m%' THEN 'port-industry'::exhibitor_category
    WHEN u.email LIKE '%-9m%' THEN 'port-operations'::exhibitor_category
    ELSE 'port-industry'::exhibitor_category
  END as category,
  CASE 
    WHEN u.email LIKE '%-54m%' THEN 'Technology'
    WHEN u.email LIKE '%-36m%' THEN 'Automation'
    WHEN u.email LIKE '%-18m%' THEN 'Equipment'
    WHEN u.email LIKE '%-9m%' THEN 'IoT'
    ELSE 'Technology'
  END as sector,
  CASE 
    WHEN u.email LIKE '%-54m%' THEN 'Leader in maritime automation and port technology solutions'
    WHEN u.email LIKE '%-36m%' THEN 'Cutting-edge automation systems for modern ports'
    WHEN u.email LIKE '%-18m%' THEN 'Premium maritime equipment supplier'
    WHEN u.email LIKE '%-9m%' THEN 'Innovative IoT solutions for port operations'
    ELSE 'Port exhibitor'
  END as description,
  jsonb_build_object('email', u.email, 'phone', '+212 6 00 00 00 00', 'name', u.name) as contact_info,
  NOW(),
  NOW()
FROM public.users u
WHERE u.type = 'exhibitor' AND u.email LIKE '%@test.siport.com';

-- Create partners from users with type='partner'
INSERT INTO public.partners (user_id, company_name, partner_type, partnership_level, sector, description, contact_info, created_at, updated_at)
SELECT 
  u.id,
  u.name,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'corporate'
    WHEN u.email LIKE '%silver%' THEN 'tech'
    WHEN u.email LIKE '%platinium%' THEN 'corporate'
    WHEN u.email LIKE '%museum%' THEN 'cultural'
    WHEN u.email LIKE '%porttech%' THEN 'tech'
    WHEN u.email LIKE '%oceanfreight%' THEN 'logistics'
    WHEN u.email LIKE '%coastal%' THEN 'services'
    ELSE 'corporate'
  END as partner_type,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'gold'
    WHEN u.email LIKE '%silver%' THEN 'silver'
    WHEN u.email LIKE '%platinium%' THEN 'platinium'
    WHEN u.email LIKE '%museum%' THEN 'museum'
    WHEN u.email LIKE '%porttech%' THEN 'gold'
    WHEN u.email LIKE '%oceanfreight%' THEN 'silver'
    WHEN u.email LIKE '%coastal%' THEN 'silver'
    ELSE 'silver'
  END as partnership_level,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'Port Operations'
    WHEN u.email LIKE '%silver%' THEN 'Technology'
    WHEN u.email LIKE '%platinium%' THEN 'Port Management'
    WHEN u.email LIKE '%museum%' THEN 'Culture & Heritage'
    WHEN u.email LIKE '%porttech%' THEN 'Technology'
    WHEN u.email LIKE '%oceanfreight%' THEN 'Logistics'
    WHEN u.email LIKE '%coastal%' THEN 'Maritime Services'
    ELSE 'General'
  END as sector,
  CASE 
    WHEN u.email LIKE '%gold%' THEN 'Premium partnership for port excellence'
    WHEN u.email LIKE '%silver%' THEN 'Technology partner for digital transformation'
    WHEN u.email LIKE '%platinium%' THEN 'Global platinum partner'
    WHEN u.email LIKE '%museum%' THEN 'Cultural partnership for heritage'
    WHEN u.email LIKE '%porttech%' THEN 'Port technology innovation partner'
    WHEN u.email LIKE '%oceanfreight%' THEN 'Maritime freight specialist'
    WHEN u.email LIKE '%coastal%' THEN 'Comprehensive maritime services'
    ELSE 'Strategic partner'
  END as description,
  jsonb_build_object('email', u.email, 'phone', '+212 6 00 00 00 00', 'name', u.name) as contact_info,
  NOW(),
  NOW()
FROM public.users u
WHERE u.type = 'partner' AND u.email LIKE '%@test.siport.com';

-- Verify the data was created
SELECT 'Exhibitors created' as status, COUNT(*) as count FROM public.exhibitors;
SELECT 'Partners created' as status, COUNT(*) as count FROM public.partners;
