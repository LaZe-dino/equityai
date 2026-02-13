-- EquityAI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('founder', 'investor', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  linkedin_url TEXT,
  bio TEXT,
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPANIES
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sector TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('pre-seed', 'seed', 'series-a')),
  website TEXT,
  logo_url TEXT,
  pitch_deck_url TEXT,
  founded_year INT,
  team_size INT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OFFERINGS
-- ============================================
CREATE TABLE offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  offering_type TEXT NOT NULL CHECK (offering_type IN ('equity', 'safe', 'convertible-note')),
  target_raise BIGINT NOT NULL,
  minimum_investment BIGINT NOT NULL,
  valuation_cap BIGINT,
  equity_percentage DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under-review', 'live', 'funded', 'closed')),
  deadline TIMESTAMPTZ,
  terms_url TEXT,
  highlights JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  use_of_funds JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVESTOR PROFILES
-- ============================================
CREATE TABLE investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  accredited BOOLEAN DEFAULT FALSE,
  investment_min BIGINT,
  investment_max BIGINT,
  sectors_of_interest TEXT[] DEFAULT '{}',
  stages_of_interest TEXT[] DEFAULT '{}',
  portfolio_size INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INTERESTS (investor → offering)
-- ============================================
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  offering_id UUID NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
  amount BIGINT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(investor_id, offering_id)
);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  offering_id UUID REFERENCES offerings(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pitch-deck', 'financials', 'term-sheet', 'other')),
  file_size INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAVED OFFERINGS (bookmarks)
-- ============================================
CREATE TABLE saved_offerings (
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  offering_id UUID NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (investor_id, offering_id)
);

-- ============================================
-- ACTIVITY LOG
-- ============================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_companies_founder ON companies(founder_id);
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_offerings_company ON offerings(company_id);
CREATE INDEX idx_offerings_status ON offerings(status);
CREATE INDEX idx_offerings_type ON offerings(offering_type);
CREATE INDEX idx_interests_investor ON interests(investor_id);
CREATE INDEX idx_interests_offering ON interests(offering_id);
CREATE INDEX idx_interests_status ON interests(status);
CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_offering ON documents(offering_id);
CREATE INDEX idx_saved_offerings_investor ON saved_offerings(investor_id);
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- COMPANIES
CREATE POLICY "Companies are viewable by everyone" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Founders can create companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Founders can update own companies" ON companies
  FOR UPDATE USING (auth.uid() = founder_id);

CREATE POLICY "Founders can delete own companies" ON companies
  FOR DELETE USING (auth.uid() = founder_id);

-- OFFERINGS
CREATE POLICY "Live offerings are viewable by everyone" ON offerings
  FOR SELECT USING (
    status = 'live'
    OR EXISTS (
      SELECT 1 FROM companies WHERE companies.id = offerings.company_id AND companies.founder_id = auth.uid()
    )
  );

CREATE POLICY "Founders can create offerings for their companies" ON offerings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.founder_id = auth.uid())
  );

CREATE POLICY "Founders can update own offerings" ON offerings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.founder_id = auth.uid())
  );

-- INVESTOR PROFILES
CREATE POLICY "Investor profiles viewable by authenticated users" ON investor_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Investors can manage own profile" ON investor_profiles
  FOR ALL USING (auth.uid() = user_id);

-- INTERESTS
CREATE POLICY "Investors can view own interests" ON interests
  FOR SELECT USING (
    auth.uid() = investor_id
    OR EXISTS (
      SELECT 1 FROM offerings
      JOIN companies ON companies.id = offerings.company_id
      WHERE offerings.id = interests.offering_id AND companies.founder_id = auth.uid()
    )
  );

CREATE POLICY "Investors can create interests" ON interests
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Investors can update own interests" ON interests
  FOR UPDATE USING (
    auth.uid() = investor_id
    OR EXISTS (
      SELECT 1 FROM offerings
      JOIN companies ON companies.id = offerings.company_id
      WHERE offerings.id = interests.offering_id AND companies.founder_id = auth.uid()
    )
  );

-- DOCUMENTS
CREATE POLICY "Documents viewable by authenticated users" ON documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Founders can upload documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Founders can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = uploaded_by);

-- SAVED OFFERINGS
CREATE POLICY "Users can manage own saved offerings" ON saved_offerings
  FOR ALL USING (auth.uid() = investor_id);

-- ACTIVITY LOG
CREATE POLICY "Users can view own activity" ON activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert activity" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'investor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_offerings_updated_at BEFORE UPDATE ON offerings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_investor_profiles_updated_at BEFORE UPDATE ON investor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_interests_updated_at BEFORE UPDATE ON interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Avatars are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "Logos are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');
