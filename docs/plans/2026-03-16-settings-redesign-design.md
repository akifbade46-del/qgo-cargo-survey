# Settings Page Redesign - Design Document

**Date:** 2026-03-16
**Status:** Approved
**Approach:** All at Once (10 tabs)
**Storage:** Mixed (key-value + dedicated tables)
**UI Layout:** Horizontal Tabs with lazy loading

---

## Overview

Complete overhaul of the Settings page to include 10 comprehensive configuration sections for managing all aspects of the Q'go Cargo Survey system.

---

## UI Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SETTINGS                                               [Save All]      │
├─────────────────────────────────────────────────────────────────────────┤
│  [Company] [Pricing] [Workflow] [Notifications] [Branding] [Landing]    │
│  [Zones] [Categories] [Legal] [Custom Fields]                           │
├─────────────────────────────────────────────────────────────────────────┤
│                          TAB CONTENT (lazy loaded)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Existing Tables (key-value storage)
- `app_settings` - Simple key-value pairs for settings

### New Tables

```sql
-- Zones for shipping rates
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  countries TEXT[] NOT NULL,
  base_rate DECIMAL(10,2) NOT NULL,
  rate_per_cbm DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item Categories
CREATE TABLE item_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Fields for surveys
CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'date', 'dropdown', 'checkbox')),
  options TEXT[], -- For dropdown type
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Landing Page Content
CREATE TABLE landing_page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE, -- 'hero', 'features', 'social_proof'
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE, -- 'new_survey', 'survey_assigned', etc.
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[], -- Available variables for template
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Tabs Detail

### Tab 1: Company (Existing)
- Company Name, Email, Phone, Address, Website
- Currency, Currency Symbol
- SMTP Settings (Host, Port, User, Pass, From Email, From Name)

### Tab 2: Pricing Defaults
| Setting | Key | Type |
|---------|-----|------|
| Default CBM Rate | `default_cbm_rate` | number |
| Insurance % | `insurance_percent` | number |
| Tax % | `tax_percent` | number |
| Minimum Charge | `minimum_charge` | number |

### Tab 3: Survey Workflow
| Setting | Key | Type |
|---------|-----|------|
| Auto-assign Surveys | `auto_assign_surveys` | boolean |
| Assignment Method | `assignment_method` | enum (round_robin, nearest, manual) |
| Survey Deadline (hours) | `survey_deadline_hours` | number |
| Reminder Before (hours) | `reminder_before_hours` | number |

### Tab 4: Notifications
- Toggle switches for each notification type
- Edit template modal for each
- Template variables reference

### Tab 5: Branding
| Setting | Key | Type |
|---------|-----|------|
| Logo URL | `logo_url` | text |
| Favicon URL | `favicon_url` | text |
| Primary Color | `color_primary` | text (hex) |
| Secondary Color | `color_secondary` | text (hex) |
| Navy Color | `color_navy` | text (hex) |

### Tab 6: Landing Page
- Hero Section: headline, subheadline, CTA text, background video URL
- Features Section: Array of features (icon, title, description)
- Social Proof: Array of client logos (image URL, company name)

### Tab 7: Zones
- CRUD table for zones
- Columns: Name, Countries (multi-select), Base Rate, Rate per CBM, Active
- Search and filter

### Tab 8: Categories
- CRUD table for item categories
- Columns: Icon, Name, Description, Active, Sort Order

### Tab 9: Legal
- Terms & Conditions (rich text)
- Privacy Policy (rich text)
- Refund Policy (rich text)

### Tab 10: Custom Fields
- CRUD table for custom survey fields
- Columns: Field Name, Type (text/textarea/number/date/dropdown/checkbox), Required, Active
- Options field for dropdown type

---

## Components Structure

```
src/pages/admin/AdminSettings.jsx (main with tabs)
src/components/settings/
├── CompanyTab.jsx
├── PricingTab.jsx
├── WorkflowTab.jsx
├── NotificationsTab.jsx
├── BrandingTab.jsx
├── LandingPageTab.jsx
├── ZonesTab.jsx
├── CategoriesTab.jsx
├── LegalTab.jsx
├── CustomFieldsTab.jsx
└── shared/
    ├── SettingInput.jsx
    ├── SettingToggle.jsx
    ├── SettingColorPicker.jsx
    ├── EmailTemplateModal.jsx
    └── RichTextEditor.jsx
```

---

## App_Settings Keys (Key-Value Store)

### Pricing
- `default_cbm_rate`
- `insurance_percent`
- `tax_percent`
- `minimum_charge`

### Workflow
- `auto_assign_surveys`
- `assignment_method`
- `survey_deadline_hours`
- `reminder_before_hours`

### Branding
- `logo_url`
- `favicon_url`
- `color_primary`
- `color_secondary`
- `color_navy`

### Landing Page
- `landing_hero_headline`
- `landing_hero_subheadline`
- `landing_hero_cta`
- `landing_hero_video_url`
- `landing_features` (JSON)
- `landing_social_proof` (JSON)

### Legal
- `terms_content`
- `privacy_content`
- `refund_content`

---

## Implementation Priority

1. **Phase 1:** Database migrations (zones, categories, custom_fields, email_templates, landing_page_content)
2. **Phase 2:** Main AdminSettings.jsx with tabs routing
3. **Phase 3:** Tab components (Company, Pricing, Workflow)
4. **Phase 4:** Tab components (Notifications, Branding)
5. **Phase 5:** Tab components (Landing Page, Zones, Categories)
6. **Phase 6:** Tab components (Legal, Custom Fields)
7. **Phase 7:** Integration and testing
