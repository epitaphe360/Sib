-- ========================================
-- Create Profile Tables for Multi-Tier System
-- ========================================
-- This migration creates the profile tables that the seed file and multi-tier system expect
--
-- Tables: visitor_profiles, partner_profiles, exhibitor_profiles
-- All linked to users table via user_id
-- ========================================

-- 1. Create visitor_profiles table
CREATE TABLE IF NOT EXISTS visitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  position text,
  phone text,
  country text,
  visitor_type text CHECK (visitor_type IN ('company', 'professional', 'student', 'press')),
  pass_type text CHECK (pass_type IN ('free', 'vip', 'premium')),
  interests text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_profiles_user_id ON visitor_profiles(user_id);

-- 2. Create partner_profiles table
CREATE TABLE IF NOT EXISTS partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  description text,
  logo_url text,
  website text,
  country text,
  partnership_level text CHECK (partnership_level IN ('museum', 'silver', 'gold', 'platinium')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON partner_profiles(user_id);

-- 3. Create exhibitor_profiles table
CREATE TABLE IF NOT EXISTS exhibitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  company_name text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  description text,
  logo_url text,
  website text,
  country text,
  sector text,
  category text,
  stand_number text,
  stand_area numeric DEFAULT 9.0 CHECK (stand_area > 0 AND stand_area <= 200),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_user_id ON exhibitor_profiles(user_id);

-- Enable RLS on all profile tables
ALTER TABLE visitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_profiles
CREATE POLICY "Users can view their own visitor profile"
  ON visitor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visitor profile"
  ON visitor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visitor profile"
  ON visitor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for partner_profiles
CREATE POLICY "Anyone can view partner profiles"
  ON partner_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own partner profile"
  ON partner_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partner profile"
  ON partner_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for exhibitor_profiles
CREATE POLICY "Anyone can view exhibitor profiles"
  ON exhibitor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own exhibitor profile"
  ON exhibitor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exhibitor profile"
  ON exhibitor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
DROP TRIGGER IF EXISTS update_visitor_profiles_updated_at ON visitor_profiles;
CREATE TRIGGER update_visitor_profiles_updated_at
  BEFORE UPDATE ON visitor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

DROP TRIGGER IF EXISTS update_partner_profiles_updated_at ON partner_profiles;
CREATE TRIGGER update_partner_profiles_updated_at
  BEFORE UPDATE ON partner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

DROP TRIGGER IF EXISTS update_exhibitor_profiles_updated_at ON exhibitor_profiles;
CREATE TRIGGER update_exhibitor_profiles_updated_at
  BEFORE UPDATE ON exhibitor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();
