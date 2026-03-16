# OwnTracks Setup Guide - Background GPS Tracking

## Kya Hai Ye?

OwnTracks ek FREE app hai jo GPS tracking karta hai **background mein** - matlab phone lock hone pe bhi chalta rahega.

**Problem:** Browser GPS tab band ho jata hai jab phone screen off hoti hai
**Solution:** OwnTracks 24/7 track karta hai, phone pocket mein ho ya lock ho

---

## Part 1: Admin Setup

### Step 1.1: Admin Panel Kholo

```
URL: http://localhost:5173/admin/owntracks
```

Ya production mein:
```
URL: https://your-domain.com/admin/owntracks
```

### Step 1.2: Webhook URL Copy Karo

Page pe ye URL dikhega:
```
https://evxjnkoxupqkmewtuusv.supabase.co/functions/v1/owntracks-webhook
```

Isko copy kar lo - surveyor ko dena hai.

### Step 1.3: Har Surveyor Ka Device ID Set Karo

1. Surveyor list mein uska naam pe "Set Device ID" click karo
2. Ek unique ID generate hoga (e.g., `surveyor-a1b2c3`)
3. Save karo
4. Ye ID surveyor ko batao

**Example Device IDs:**
| Surveyor | Device ID |
|----------|-----------|
| Mohammed | surveyor-mohammed |
| Ahmed | surveyor-ahmed |
| Ali | surveyor-ali |

---

## Part 2: Surveyor App Setup

### Step 2.1: App Download Karo

**iPhone:**
1. App Store kholo
2. Search karo: **OwnTracks**
3. Download karo (FREE app hai)

**Android:**
1. Play Store kholo
2. Search karo: **OwnTracks**
3. Install karo

### Step 2.2: App Configuration

App kholo aur ye settings karo:

#### iPhone Settings:

```
Settings (⚙️ icon) → Connection
```

| Setting | Value |
|---------|-------|
| Mode | HTTP |
| URL | https://evxjnkoxupqkmewtuusv.supabase.co/functions/v1/owntracks-webhook |
| Device ID | (Admin se liya hua ID) |
| Publishing | ON |

#### Android Settings:

```
Preferences → Connection
```

| Setting | Value |
|---------|-------|
| Mode | HTTP |
| URL | https://evxjnkoxupqkmewtuusv.supabase.co/functions/v1/owntracks-webhook |
| Device ID | (Admin se liya hua ID) |

### Step 2.3: Permissions Allow Karo

**Location Permission:**
- iPhone: Settings → OwnTracks → Location → **Always**
- Android: Settings → Apps → OwnTracks → Permissions → Location → **Allow all the time**

**Battery Optimization (IMPORTANT):**
- iPhone: Settings → Battery → Low Power Mode → OFF (jab tracking chal raha ho)
- Android: Settings → Battery → Battery Optimization → OwnTracks → **Don't optimize**

---

## Part 3: Testing

### Step 3.1: OwnTracks Start Karo

1. OwnTracks app kholo
2. Location sharing ON karo
3. Kahi bahir jao (location change hone do)

### Step 3.2: Admin Panel Check Karo

```
URL: /admin/owntracks
```

Surveyor ke saamne **green dot** aur **"Active"** dikhai dena chahiye.

### Step 3.3: GPS Logs Check Karo

Database mein `gps_logs` table check karo:
```sql
SELECT * FROM gps_logs
WHERE source = 'owntracks'
ORDER BY timestamp DESC
LIMIT 10;
```

---

## Part 4: Daily Usage

### Survey Shuru Karne Se Pehle:

1. OwnTracks app ON karo
2. Location sharing confirm karo
3. Survey page kholo - "OwnTracks Active" dikhega

### Survey Ke Dauran:

- Phone pocket mein rakh sakte ho
- Screen OFF bhi kar sakte ho
- GPS track hota rahega

### Survey Ke Baad:

- App chalne dein ya OFF kar dein - choice hai
- Battery bachane ke liye OFF kar sakte ho

---

## Troubleshooting

### Problem: "Not connected" dikhai de raha hai

**Solution:**
1. App mein URL sahi hai?
2. Device ID sahi hai?
3. Internet connection hai?
4. Location permission "Always" hai?

### Problem: Location update nahi ho raha

**Solution:**
1. Battery optimization OFF kiya?
2. App background mein chal rahi hai?
3. Phone restart karo

### Problem: Accuracy kam hai

**Solution:**
1. High accuracy mode ON karo (Android)
2. WiFi bhi ON rakho (GPS accuracy improve hoti hai)

---

## Quick Reference Card

### Webhook URL:
```
https://evxjnkoxupqkmewtuusv.supabase.co/functions/v1/owntracks-webhook
```

### App Settings Summary:
```
Mode: HTTP
URL: [webhook URL]
Device ID: [admin se lo]
Location: Always Allow
Battery: No Optimization
```

### Admin Panel:
```
/admin/owntracks
```

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SETUP FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ADMIN                         SURVEYOR                        │
│     │                              │                            │
│     │ 1. Generate Device ID       │                            │
│     │─────────────────────────────>│                            │
│     │                              │                            │
│     │ 2. Share Webhook URL        │                            │
│     │─────────────────────────────>│                            │
│     │                              │                            │
│     │                              │ 3. Install OwnTracks       │
│     │                              │                            │
│     │                              │ 4. Configure App           │
│     │                              │    - URL                   │
│     │                              │    - Device ID             │
│     │                              │                            │
│     │                              │ 5. Start Tracking          │
│     │                              │                            │
│     │ 6. See "Active" status      │                            │
│     │<─────────────────────────────│                            │
│     │                              │                            │
│     │                              │ 7. GPS logs being sent     │
│     │                              │    automatically           │
│     │                              │                            │
│     │ 8. Customer sees live       │                            │
│     │    tracking on map          │                            │
│     │                              │                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Support

Agar koi problem aaye toh:
1. Ye document dubara check karo
2. Admin panel mein status dekho
3. App restart karo
4. Phone restart karo

---

*Last Updated: March 2026*
