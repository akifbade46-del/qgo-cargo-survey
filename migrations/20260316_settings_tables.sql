-- Settings Redesign - New Tables
-- Run this migration in Supabase SQL Editor

-- ============================================
-- 1. ZONES TABLE (for shipping rates)
-- ============================================
CREATE TABLE IF NOT EXISTS public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  countries TEXT[] NOT NULL DEFAULT '{}',
  base_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  rate_per_cbm DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for zones
CREATE POLICY "Admins can manage zones" ON public.zones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Anyone can view active zones" ON public.zones
  FOR SELECT USING (is_active = true);

-- Index
CREATE INDEX idx_zones_active ON public.zones(is_active);

-- ============================================
-- 2. ITEM CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.item_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.item_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage categories" ON public.item_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Anyone can view active categories" ON public.item_categories
  FOR SELECT USING (is_active = true);

-- Index
CREATE INDEX idx_categories_active ON public.item_categories(is_active);

-- ============================================
-- 3. CUSTOM FIELDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'date', 'dropdown', 'checkbox')),
  options TEXT[] DEFAULT '{}',
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage custom fields" ON public.custom_fields
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Anyone can view active custom fields" ON public.custom_fields
  FOR SELECT USING (is_active = true);

-- Index
CREATE INDEX idx_custom_fields_active ON public.custom_fields(is_active);

-- ============================================
-- 4. EMAIL TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Anyone can view active templates" ON public.email_templates
  FOR SELECT USING (is_active = true);

-- ============================================
-- 5. LANDING PAGE CONTENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.landing_page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.landing_page_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage landing content" ON public.landing_page_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Anyone can view landing content" ON public.landing_page_content
  FOR SELECT USING (true);

-- ============================================
-- SEED DEFAULT DATA
-- ============================================

-- Default Email Templates
INSERT INTO public.email_templates (template_key, name, subject, body, variables) VALUES
('new_survey_request', 'New Survey Request', 'New Survey Request from {{customer_name}}', 'A new survey request has been submitted.\n\nCustomer: {{customer_name}}\nEmail: {{customer_email}}\nPhone: {{customer_phone}}\nFrom: {{from_city}}\nTo: {{to_city}}\n\nView details: {{survey_link}}', ARRAY['customer_name', 'customer_email', 'customer_phone', 'from_city', 'to_city', 'survey_link']),
('survey_assigned', 'Survey Assigned', 'You have been assigned a survey', 'Hello {{surveyor_name}},\n\nYou have been assigned a new survey.\n\nCustomer: {{customer_name}}\nDate: {{survey_date}}\nLocation: {{location}}\n\nView details: {{survey_link}}', ARRAY['surveyor_name', 'customer_name', 'survey_date', 'location', 'survey_link']),
('survey_completed', 'Survey Completed', 'Your survey has been completed', 'Hello {{customer_name}},\n\nYour survey request has been completed.\n\nSurvey ID: {{survey_id}}\nTotal CBM: {{total_cbm}}\nEstimated Cost: {{estimated_cost}}\n\nView report: {{report_link}}', ARRAY['customer_name', 'survey_id', 'total_cbm', 'estimated_cost', 'report_link']),
('welcome_surveyor', 'Welcome to QGo Cargo', 'Welcome to QGo Cargo Survey Team', 'Hello {{surveyor_name}},\n\nWelcome to the QGo Cargo Survey team!\n\nYour account has been created.\nEmail: {{email}}\nPassword: {{temp_password}}\n\nPlease login and change your password.\n\nLogin URL: {{login_url}}', ARRAY['surveyor_name', 'email', 'temp_password', 'login_url'])
ON CONFLICT (template_key) DO NOTHING;

-- Default Landing Page Content
INSERT INTO public.landing_page_content (section, content) VALUES
('hero', '{"headline": "Get Your Free Survey Today", "subheadline": "Professional moving surveys with real-time tracking and instant quotes", "cta_text": "Get Started", "video_url": ""}'),
('features', '[{"icon": "📍", "title": "Real-time Tracking", "description": "Track your survey in real-time with GPS precision"}, {"icon": "📦", "title": "Instant Quotes", "description": "Get accurate volume estimates and pricing instantly"}, {"icon": "✅", "title": "Digital Reports", "description": "Receive detailed PDF reports within minutes"}]'),
('social_proof', '[]')
ON CONFLICT (section) DO NOTHING;

-- Default Item Categories
INSERT INTO public.item_categories (name, icon, description, sort_order) VALUES
('Furniture', '🛋️', 'Sofas, beds, tables, chairs, etc.', 1),
('Appliances', '📺', 'TVs, refrigerators, washing machines, etc.', 2),
('Boxes', '📦', 'Packed boxes and cartons', 3),
('Electronics', '💻', 'Computers, gaming consoles, audio equipment', 4),
('Kitchen Items', '🍳', 'Cookware, utensils, small appliances', 5),
('Bedding & Linens', '🛏️', 'Mattresses, blankets, pillows, curtains', 6),
('Art & Decor', '🖼️', 'Paintings, sculptures, decorative items', 7),
('Outdoor Items', '🌿', 'Garden furniture, plants, outdoor equipment', 8)
ON CONFLICT DO NOTHING;

-- Default Zones
INSERT INTO public.zones (name, countries, base_rate, rate_per_cbm, sort_order) VALUES
('GCC', ARRAY['Kuwait', 'UAE', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Oman'], 15.00, 12.00, 1),
('Middle East', ARRAY['Iraq', 'Iran', 'Jordan', 'Lebanon', 'Syria', 'Turkey'], 25.00, 18.00, 2),
('Europe', ARRAY['UK', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium'], 45.00, 35.00, 3),
('Asia Pacific', ARRAY['India', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'Philippines', 'Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'China', 'Japan', 'Australia'], 35.00, 25.00, 4),
('North America', ARRAY['USA', 'Canada', 'Mexico'], 55.00, 45.00, 5),
('Africa', ARRAY['Egypt', 'South Africa', 'Kenya', 'Nigeria', 'Morocco'], 40.00, 30.00, 6)
ON CONFLICT DO NOTHING;
