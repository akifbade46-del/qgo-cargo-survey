# Q'go Cargo Survey Platform — AI Agent Context

This file gives any AI agent, Claude instance, or CLI tool complete context to manage, extend, and debug this project using the **Supabase MCP server**.

---

## Project Identity

| Key | Value |
|-----|-------|
| **Project Name** | Q'go Cargo Survey Platform |
| **Company** | Q'go Cargo, Kuwait |
| **Purpose** | End-to-end logistics survey management — customer requests, surveyor dispatch, GPS tracking, CBM calculation, container recommendations, PDF reports |
| **Stack** | React 18 + Vite + Tailwind CSS (frontend) · Supabase (backend/DB/auth) · OpenStreetMap/Leaflet (maps) · Framer Motion (animations) · Docker + Nginx (deployment) |

---

## Supabase Project

| Key | Value |
|-----|-------|
| **Project ID** | `evxjnkoxupqkmewtuusv` |
| **Project Name** | qgo-cargo-survey |
| **Region** | ap-south-1 (Mumbai) |
| **API URL** | `https://evxjnkoxupqkmewtuusv.supabase.co` |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eGpua294dXBxa21ld3R1dXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTMxNzgsImV4cCI6MjA4OTE2OTE3OH0.SDyjQtl6AJ1CNCoYBZPnQ6mDS5hi8n2f47zRuVZGzM8` |
| **Organization ID** | `ftcpzooxtqronekywxpt` |
| **Organization Name** | QGO SURVAY |

---

## MCP Connection

This project uses **Supabase MCP** to allow AI agents to directly manage the database.

### Setup (Claude Desktop / Cursor / Windsurf / any MCP client)

Add this to your MCP config file (`~/.claude/claude_desktop_config.json` or equivalent):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token", "<YOUR_SUPABASE_PERSONAL_ACCESS_TOKEN>"
      ]
    }
  }
}
```

Get your Personal Access Token at: https://supabase.com/dashboard/account/tokens

### Available MCP Tools

Once connected, these tools are available:

| Tool | Description |
|------|-------------|
| `list_projects` | List all Supabase projects |
| `get_project` | Get project details by ID |
| `list_tables` | List all tables with columns and FK constraints |
| `execute_sql` | Run raw SQL queries (SELECT, UPDATE, etc.) |
| `apply_migration` | Apply DDL migrations (CREATE TABLE, ALTER, etc.) |
| `list_migrations` | View all applied migrations |
| `deploy_edge_function` | Deploy or update Edge Functions |
| `list_edge_functions` | List all deployed Edge Functions |
| `get_edge_function` | Get Edge Function source code |
| `get_logs` | Fetch logs (api, postgres, edge-function, auth, etc.) |
| `get_advisors` | Security & performance advisor checks |
| `get_publishable_keys` | Get project API keys |
| `get_project_url` | Get project API URL |
| `create_project` | Create a new Supabase project |
| `list_organizations` | List all organizations |
| `list_extensions` | List all Postgres extensions |
| `list_branches` | List dev branches |
| `create_branch` | Create a dev branch |
| `merge_branch` | Merge branch to production |
| `reset_branch` | Reset a branch |

### Common MCP Operations

```
# Check project status
list_projects → find project evxjnkoxupqkmewtuusv

# View all tables
list_tables(project_id="evxjnkoxupqkmewtuusv", schemas=["public"], verbose=true)

# Run a query
execute_sql(project_id="evxjnkoxupqkmewtuusv", query="SELECT * FROM survey_requests LIMIT 10")

# Apply a new migration
apply_migration(project_id="evxjnkoxupqkmewtuusv", name="add_new_column", query="ALTER TABLE ...")

# Check for security issues
get_advisors(project_id="evxjnkoxupqkmewtuusv", type="security")

# Check performance
get_advisors(project_id="evxjnkoxupqkmewtuusv", type="performance")

# View recent errors
get_logs(project_id="evxjnkoxupqkmewtuusv", service="postgres")
get_logs(project_id="evxjnkoxupqkmewtuusv", service="edge-function")

# Deploy an edge function
deploy_edge_function(project_id="evxjnkoxupqkmewtuusv", name="send-email", files=[...])
```

---

## Database Schema

### Enums

| Enum | Values |
|------|--------|
| `user_role` | `super_admin`, `operations_manager`, `surveyor`, `customer` |
| `survey_status` | `pending`, `assigned`, `in_progress`, `surveyed`, `completed`, `cancelled` |
| `move_type` | `local`, `domestic`, `international` |
| `container_type` | `lcl`, `groupage`, `20ft`, `20ft_hc`, `40ft`, `40ft_hc` |

### Tables (15 total)

#### `profiles`
Extends `auth.users`. Auto-created on signup via trigger.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | References auth.users |
| email | varchar | |
| full_name | varchar | |
| phone | varchar | |
| role | user_role | default: customer |
| avatar_url | text | |
| is_active | boolean | default: true |
| created_at / updated_at | timestamptz | |

#### `survey_requests`
Core table. One record per customer survey request.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| reference_number | varchar UNIQUE | Auto-generated: QGO-YYYYMM-XXXXXX |
| customer_name / email / phone / whatsapp_number | varchar | |
| from_address / from_city / from_country | text/varchar | |
| to_address / to_city / to_country | text/varchar | |
| move_type | move_type enum | |
| property_type / floor / has_elevator / bedrooms | varchar/bool | |
| preferred_date / preferred_time_slot | date/varchar | |
| confirmed_date / confirmed_time | date/time | |
| estimated_move_date | date | |
| assigned_surveyor_id | uuid FK → surveyors | |
| assigned_by / assigned_at | uuid/timestamptz | |
| status | survey_status enum | default: pending |
| tracking_token | text | Unique per survey for live map link |
| special_requirements / additional_services | text[] | |
| notes | text | |
| created_by / created_at / updated_at | uuid/timestamptz | |

#### `survey_rooms`
Room-wise breakdown within a survey.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| survey_request_id | uuid FK → survey_requests | Cascade delete |
| room_name | varchar | e.g. "Master Bedroom" |
| room_type | varchar | |
| floor_number | int | default: 0 |
| notes | text | |
| photos | jsonb | Array of photo URLs |

#### `survey_items`
Individual items within a room.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| survey_room_id | uuid FK → survey_rooms | Cascade delete |
| item_id | uuid FK → items | null if manual entry |
| custom_name | varchar | Used for manual entries |
| custom_length / width / height | numeric | cm |
| is_manual_entry | boolean | |
| quantity | int | default: 1 |
| cbm | numeric | Calculated: L×W×H/1,000,000 |
| weight_kg | numeric | |
| condition | varchar | good/fair/poor |
| is_fragile / requires_packing / requires_disassembly | boolean | |
| photos | jsonb | |
| notes | text | |

#### `items`
Pre-loaded item library (200+ items).
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| category_id | uuid FK → item_categories | |
| name | varchar | English |
| name_ar | varchar | Arabic |
| default_length / width / height | numeric | cm |
| default_cbm | numeric GENERATED | Auto-calculated |
| default_weight_kg | numeric | |
| is_fragile / requires_disassembly | boolean | |
| is_active | boolean | |

#### `item_categories`
10 categories: Living Room, Bedroom, Kitchen, Dining Room, Office, Outdoor, Special Items, Boxes, Appliances, Other. Each has Arabic name.

#### `surveyors`
Staff who conduct surveys.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| employee_id | varchar UNIQUE | |
| name / phone | varchar | |
| is_available | boolean | |
| current_location | jsonb | {latitude, longitude, updated_at} |
| tracking_device_id | varchar | GPSLogger device ID |

#### `survey_reports`
Auto-generated when survey status → 'surveyed'.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| survey_request_id | uuid FK UNIQUE | |
| total_items / total_cbm / total_weight_kg | int/numeric | |
| recommended_container | container_type enum | |
| container_recommendation | jsonb | Full recommendation details |
| estimated_cost / currency | numeric/varchar | |
| pdf_url | text | |
| status | varchar | draft/approved |
| approved_by / approved_at | uuid/timestamptz | |

#### `gps_logs`
High-frequency GPS data from surveyors.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| surveyor_id | uuid FK → surveyors | |
| survey_request_id | uuid FK | |
| latitude / longitude | numeric | |
| accuracy / speed | numeric | |
| battery_level | int | |
| source | varchar | browser/gpslogger/owntracks |
| timestamp | timestamptz | |

#### `tracking_sessions`
Active tracking session per survey.

#### `container_specs`
6 container types with CBM capacities: lcl (4.25), groupage (12.75), 20ft (28.2), 20ft_hc (31.7), 40ft (57.5), 40ft_hc (64.9).

#### `app_settings`
12 key-value settings: SMTP config (host, port, user, pass, from, from_name) and company info (name, phone, email, address, website, currency).

#### `notifications`
Per-user notifications with type (info/success/warning/error) and read status.

#### `survey_activity`
Audit log of actions on survey requests.

#### `email_logs`
Log of all emails sent with status (sent/failed/no_smtp_configured).

---

## Applied Migrations (in order)

| Version | Name |
|---------|------|
| 20260315191031 | 01_extensions_and_enums |
| 20260315191041 | 02_profiles_table |
| 20260315191058 | 03_core_tables |
| 20260315191112 | 04_survey_rooms_and_items |
| 20260315191124 | 05_tracking_and_logs |
| 20260315191145 | 06_indexes_and_rls |
| 20260315191213 | 07_seed_container_specs |
| 20260315191335 | 08_seed_items_library |
| 20260315193238 | 09_email_templates_and_settings |
| 20260315193253 | 10_survey_report_function |
| 20260315194133 | 11_security_fixes |
| 20260315194205 | 12_rls_perf_optimizations |

---

## RLS Policies (Row Level Security)

All 15 tables have RLS enabled. Key policies:

| Table | Policy | Rule |
|-------|--------|------|
| profiles | profiles_access | Own profile OR super_admin/operations_manager |
| survey_requests | survey_requests_read | Public SELECT (for tracking token) |
| survey_requests | survey_requests_admin_write | super_admin/operations_manager only |
| survey_requests | survey_requests_insert_anon | Anyone can INSERT (customer form) — requires valid email + name |
| items / item_categories / container_specs | *_read | Public SELECT |
| surveyors | surveyors_access | Own record OR admin |
| gps_logs | gps_logs_insert | Anyone can INSERT with valid lat/lng |
| gps_logs | gps_logs_admin_read | Admin only |
| all other tables | staff policies | super_admin/operations_manager/surveyor |

---

## Edge Functions

| Function | Status | verify_jwt | Description |
|----------|--------|-----------|-------------|
| `send-email` | ACTIVE | false | Sends transactional emails via SMTP. Types: confirmation, assigned, report_ready |

### send-email invocation:
```json
POST https://evxjnkoxupqkmewtuusv.supabase.co/functions/v1/send-email
{
  "type": "confirmation",
  "survey_request_id": "<uuid>"
}
```
Types: `confirmation` | `assigned` | `report_ready`

---

## Database Functions

| Function | Description |
|----------|-------------|
| `generate_survey_report(uuid)` | Calculates CBM totals and upserts into survey_reports |
| `auto_generate_report()` | Trigger: fires when survey_requests.status → 'surveyed' |
| `handle_new_user()` | Trigger: creates profile on auth.users INSERT |
| `update_updated_at()` | Trigger: auto-updates updated_at columns |

---

## Key Indexes

```sql
idx_survey_requests_status
idx_survey_requests_tracking_token
idx_survey_requests_reference
idx_survey_requests_assigned_surveyor
idx_survey_rooms_request
idx_survey_items_room / _item
idx_gps_logs_surveyor / _timestamp / _survey_request
idx_items_category / _name (GIN full-text)
idx_surveyors_user
idx_tracking_sessions_request / _surveyor
idx_email_logs_survey_request
idx_notifications_user
idx_survey_activity_request / _performed_by
idx_survey_reports_approved_by
```

---

## Seeded Data

| Table | Rows |
|-------|------|
| items | 59 (Living Room, Bedroom, Kitchen, Office, Special, Boxes) |
| item_categories | 10 (English + Arabic names) |
| container_specs | 6 (LCL → 40ft HC) |
| app_settings | 12 (SMTP + company config keys) |
| profiles (admin) | 1 (super_admin) |

---

## Admin Credentials

| | |
|--|--|
| Email | `admin@qgocargo.com` |
| Password | `Qgo@Admin2026` |
| Role | `super_admin` |
| User ID | `2f1ce1ab-48a3-48ae-90b9-e08d0644f509` |

---

## Frontend Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | LandingPage | Public |
| `/survey` | SurveyWizard | Public |
| `/login` | LoginPage | Public |
| `/track/:token` | LiveTracking | Public |
| `/admin` | AdminDashboard | super_admin, operations_manager |
| `/admin/surveys` | AdminSurveys | Admin |
| `/admin/surveys/:id` | AdminSurveyDetail | Admin |
| `/admin/surveys/:id/report` | SurveyReport | Admin |
| `/admin/surveyors` | AdminSurveyors | Admin |
| `/admin/items` | AdminItems | Admin |
| `/admin/analytics` | AdminAnalytics | Admin |
| `/admin/settings` | AdminSettings | Admin |
| `/surveyor` | SurveyorDashboard | surveyor |
| `/surveyor/:id` | SurveyorSurvey | surveyor |

---

## Frontend File Structure

```
src/
├── App.jsx                          # Route definitions
├── main.jsx                         # Entry point + providers
├── index.css                        # Tailwind + global styles
├── components/
│   ├── common/
│   │   ├── QgoLogo.jsx              # Brand logo component
│   │   └── StatusBadge.jsx          # Survey status pill
│   ├── container/
│   │   └── ContainerRecommendation.jsx  # Animated container viz
│   └── surveyor/
│       └── GPSTracker.jsx           # GPS start/stop component
├── contexts/
│   └── AuthContext.jsx              # Supabase auth state + profile
├── hooks/
│   ├── useEmail.js                  # Email sending via Edge Function
│   └── useGPS.js                    # Browser geolocation + Supabase push
├── lib/
│   └── supabase.js                  # Supabase client (uses .env keys)
├── pages/
│   ├── LandingPage.jsx              # Customer landing (animated hero, map, features)
│   ├── SurveyWizard.jsx             # 5-step animated customer form
│   ├── LiveTracking.jsx             # Public GPS map page
│   ├── LoginPage.jsx                # Staff login
│   ├── admin/
│   │   ├── AdminLayout.jsx          # Sidebar nav
│   │   ├── AdminDashboard.jsx       # Stats + recent surveys
│   │   ├── AdminSurveys.jsx         # Filterable list
│   │   ├── AdminSurveyDetail.jsx    # Detail + assign + email
│   │   ├── SurveyReport.jsx         # Printable PDF report
│   │   ├── AdminSurveyors.jsx       # Surveyor CRUD
│   │   ├── AdminItems.jsx           # Item library management
│   │   ├── AdminAnalytics.jsx       # Recharts analytics
│   │   └── AdminSettings.jsx        # SMTP + company settings
│   └── surveyor/
│       ├── SurveyorLayout.jsx       # Header + nav
│       ├── SurveyorDashboard.jsx    # Assigned surveys list
│       └── SurveyorSurvey.jsx       # Room-wise item entry + GPS
└── utils/
    └── cbm.js                       # CBM calc + container recommendation logic
```

---

## Environment Variables

```bash
# .env (already configured in project)
VITE_SUPABASE_URL=https://evxjnkoxupqkmewtuusv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These are baked into the frontend at `npm run build` time via Vite's `import.meta.env`.

---

## CBM Formula

```
CBM = (Length cm × Width cm × Height cm) / 1,000,000

Container recommendation logic (src/utils/cbm.js):
  ≤ 4.25  CBM → LCL
  ≤ 12.75 CBM → Groupage
  ≤ 28.2  CBM → 20ft Standard
  ≤ 31.7  CBM → 20ft High Cube
  ≤ 57.5  CBM → 40ft Standard
  > 57.5  CBM → 40ft High Cube
```

---

## How to Run

```bash
# Local dev
npm install
npm run dev         # http://localhost:5173

# Docker (production)
docker compose up --build    # http://localhost
docker compose up --build -d  # background
docker compose down           # stop
```

---

## Common Agent Tasks

### Add a new surveyor
```sql
INSERT INTO surveyors (name, phone, employee_id)
VALUES ('Name Here', '+965 XXXX XXXX', 'EMP-001');

-- Then create auth user and link:
-- user_id = auth.users.id after creating via Supabase Auth
```

### Check all pending surveys
```sql
SELECT reference_number, customer_name, from_city, preferred_date, created_at
FROM survey_requests
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Assign a surveyor to a survey
```sql
UPDATE survey_requests
SET
  assigned_surveyor_id = '<surveyor_uuid>',
  assigned_by = '<admin_uuid>',
  assigned_at = NOW(),
  status = 'assigned'
WHERE id = '<survey_request_uuid>';
```

### Check survey CBM totals
```sql
SELECT
  sr.reference_number,
  sr.customer_name,
  rpt.total_cbm,
  rpt.recommended_container
FROM survey_requests sr
JOIN survey_reports rpt ON rpt.survey_request_id = sr.id
ORDER BY rpt.total_cbm DESC;
```

### View GPS logs for a surveyor
```sql
SELECT latitude, longitude, timestamp, battery_level
FROM gps_logs
WHERE surveyor_id = '<surveyor_uuid>'
ORDER BY timestamp DESC
LIMIT 50;
```

### Add a new item to library
```sql
INSERT INTO items (category_id, name, name_ar, default_length, default_width, default_height, default_weight_kg, is_fragile)
SELECT id, 'New Item', 'عنصر جديد', 100, 50, 80, 20, false
FROM item_categories WHERE name = 'Living Room';
```

### Update SMTP settings
```sql
UPDATE app_settings SET value = 'smtp.gmail.com' WHERE key = 'smtp_host';
UPDATE app_settings SET value = '587' WHERE key = 'smtp_port';
UPDATE app_settings SET value = 'your@gmail.com' WHERE key = 'smtp_user';
UPDATE app_settings SET value = 'your_app_password' WHERE key = 'smtp_pass';
```

### Manually trigger report generation
```sql
SELECT generate_survey_report('<survey_request_uuid>');
```

### Promote a user to admin
```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'user@example.com';
```

---

## Agent Rules

When working on this project as an AI agent:

1. **Always use `project_id = "evxjnkoxupqkmewtuusv"`** for all Supabase MCP calls.
2. **Use `apply_migration` for DDL** (CREATE, ALTER, DROP) — never `execute_sql` for schema changes.
3. **Use `execute_sql` for data operations** (SELECT, INSERT, UPDATE, DELETE).
4. **Run `get_advisors(type="security")` after any schema change** to check for missing RLS policies.
5. **Run `get_advisors(type="performance")` after adding new tables** to check for missing indexes.
6. **Never delete items or categories** without checking if surveys reference them.
7. **Tracking tokens are public** — `survey_requests` has a public SELECT policy for the live tracking feature.
8. **CBM is calculated client-side** in `src/utils/cbm.js` and stored server-side in `survey_items.cbm`.
9. **survey_reports are auto-generated** via DB trigger when status changes to 'surveyed'.
10. **Font families**: Project uses `Syne` (headings) + `DM Sans` (body) — not Inter/Roboto.
