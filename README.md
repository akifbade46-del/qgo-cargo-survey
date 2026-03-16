# Q'go Cargo — Survey Platform

Full-stack logistics survey management system.

**Stack:** React 18 + Vite + Tailwind CSS + Supabase + OpenStreetMap

---

## 🐳 Run with Docker (Recommended)

```bash
# 1. Clone / extract project
cd qgo-cargo-survey

# 2. .env file already has Supabase keys — no changes needed
#    (or copy from example)
cp .env.example .env

# 3. Build & run
docker compose up --build

# 4. Open browser
# http://localhost
```

To run in background:
```bash
docker compose up --build -d
```

To stop:
```bash
docker compose down
```

---

## 💻 Run locally (Dev mode)

```bash
npm install
npm run dev
# Open: http://localhost:5173
```

---

## 🔐 Admin Login

| | |
|--|--|
| URL | http://localhost/login |
| Email | admin@qgocargo.com |
| Password | Qgo@Admin2026 |
| Role | Super Admin |

---

## 🗺️ Routes

| Path | Description |
|------|-------------|
| `/` | Landing Page |
| `/survey` | Customer Survey Wizard |
| `/login` | Staff Login |
| `/admin` | Admin Dashboard |
| `/admin/surveys` | All Surveys |
| `/admin/surveys/:id` | Survey Detail |
| `/admin/surveys/:id/report` | PDF Report |
| `/admin/surveyors` | Surveyor Management |
| `/admin/items` | Item Library |
| `/admin/analytics` | Charts & Analytics |
| `/admin/settings` | SMTP & Company Settings |
| `/surveyor` | Surveyor Dashboard |
| `/surveyor/:id` | Room-wise Item Entry |
| `/track/:token` | Public Live Tracking Map |

---

## ☁️ Supabase

| | |
|--|--|
| Project | qgo-cargo-survey |
| Region | Mumbai (ap-south-1) |
| URL | https://evxjnkoxupqkmewtuusv.supabase.co |
| Tables | 15 |
| Items | 59 seeded |
| Containers | 6 specs |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # QgoLogo, StatusBadge
│   ├── container/       # ContainerRecommendation
│   └── surveyor/        # GPSTracker
├── contexts/            # AuthContext
├── hooks/               # useEmail, useGPS
├── lib/                 # supabase.js
├── pages/
│   ├── LandingPage.jsx  # Customer landing page
│   ├── SurveyWizard.jsx # 5-step form
│   ├── LiveTracking.jsx # GPS map
│   ├── LoginPage.jsx
│   ├── admin/           # Full admin portal
│   └── surveyor/        # Surveyor tablet app
└── utils/               # cbm.js
docker/
├── nginx.conf
Dockerfile
docker-compose.yml
.env                     # Supabase keys (ready to use)
```
