# OwnTracks Integration - Background GPS Tracking

## Overview

This integration enables **background GPS tracking** for surveyors using the OwnTracks mobile app. Unlike browser-based GPS, OwnTracks continues tracking even when the phone screen is off or the app is in background.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    DUAL GPS TRACKING                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Surveyor opens Survey Page                                      │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────┐                                        │
│  │ Check last GPS log  │                                        │
│  │ (within 2 mins?)    │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│     ┌───────┴───────┐                                           │
│     ▼               ▼                                           │
│  OwnTracks      Browser GPS                                     │
│     │               │                                           │
│  Works 24/7     Screen must be ON                               │
│  (phone locked)                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Files Created

### 1. Edge Function (Webhook)
**File:** `supabase/functions/owntracks-webhook/index.ts`

Receives location updates from OwnTracks app and stores them in the database.

**Endpoint:** `POST https://YOUR_PROJECT.supabase.co/functions/v1/owntracks-webhook`

**OwnTracks Payload Format:**
```json
{
  "_type": "location",
  "lat": 29.3759,
  "lon": 47.9774,
  "tid": "surveyor-abc123",
  "tst": 1710585600,
  "acc": 10,
  "vel": 0,
  "alt": 50,
  "batt": 85
}
```

### 2. Admin Configuration Page
**File:** `src/pages/admin/AdminOwnTracks.jsx`

**Route:** `/admin/owntracks`

Features:
- Shows webhook URL (copyable)
- Configure Device IDs for each surveyor
- Shows connection status for each surveyor
- Setup instructions for iOS and Android

### 3. Surveyor Setup Component
**File:** `src/components/surveyor/OwnTracksSetup.jsx`

Modal component shown to surveyors with step-by-step setup instructions.

### 4. Updated GPSTracker Component
**File:** `src/components/surveyor/GPSTracker.jsx`

Enhanced to:
- Detect if OwnTracks is active (received update within last 2 minutes)
- Show OwnTracks status with green indicator
- Allow browser GPS as backup
- Show setup help modal

## Database Requirements

The `surveyors` table must have a `tracking_device_id` column:

```sql
ALTER TABLE surveyors
ADD COLUMN IF NOT EXISTS tracking_device_id TEXT UNIQUE;
```

## Setup Instructions

### For Admin

1. Go to `/admin/owntracks`
2. Copy the Webhook URL
3. For each surveyor, click "Set Device ID" and generate a unique ID
4. Share the Device ID with the surveyor

### For Surveyor (iOS)

1. Download **OwnTracks** from App Store
2. Open app → Settings (gear icon)
3. Connection → Mode: **HTTP**
4. URL: Paste webhook URL
5. Device ID: Enter your assigned Device ID
6. Turn on "Publish location"
7. Allow location permissions "Always"
8. Disable battery optimization for OwnTracks

### For Surveyor (Android)

1. Download **OwnTracks** from Play Store
2. Open app → Preferences
3. Mode: **HTTP**
4. URL: Paste webhook URL
5. Device ID: Enter your assigned Device ID
6. Enable "Publish location"
7. Allow location permissions "Always"
8. Disable battery optimization for OwnTracks

## Deployment

Deploy the edge function:

```bash
supabase functions deploy owntracks-webhook
```

## Testing

1. Install OwnTracks on a test device
2. Configure with webhook URL and test Device ID
3. Start tracking in OwnTracks
4. Check `/admin/owntracks` - should show "Active" status
5. Verify GPS logs appear in database

## API Response

**Success:**
```json
{
  "success": true,
  "processed": 1,
  "total": 1
}
```

**With errors:**
```json
{
  "success": true,
  "processed": 1,
  "total": 2,
  "errors": [
    { "error": "Surveyor not found", "tid": "unknown-device" }
  ]
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No updates received | Check Device ID matches exactly |
| Updates stop | Disable battery optimization |
| Inaccurate location | Enable high accuracy in device settings |
| Connection errors | Verify webhook URL is correct |

## Benefits

- **24/7 Tracking:** Works even with phone locked
- **Battery Efficient:** OwnTracks is optimized for low power consumption
- **Reliable:** No browser session required
- **Fallback:** Browser GPS available as backup
