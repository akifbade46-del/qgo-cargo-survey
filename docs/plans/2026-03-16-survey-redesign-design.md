# Surveyor Survey UI Redesign - Design Document

**Date:** 2026-03-16
**Status:** Approved

---

## Overview

Complete redesign of the Surveyor Survey page with bottom tab navigation, card-based UI, and integrated feedback system.

---

## Design Decisions

| Aspect | Decision |
|--------|----------|
| Navigation | Bottom Tab Navigation (3 tabs) |
| Item Adding | Search + Tap suggestions |
| Visual Style | Card-Based (Google Keep/Notion style) |
| Complete Flow | Summary + Feedback popup |
| Voice Note | One at the end (Complete tab) |
| Photos | Per item (optional) |
| Floating Buttons | None - clean interface |

---

## Layout Structure

```
┌────────────────────────────────────────┐
│  Header: Survey # | Customer | CBM     │
├────────────────────────────────────────┤
│                                        │
│         TAB CONTENT AREA               │
│      (Rooms / Items / Complete)        │
│                                        │
├────────────────────────────────────────┤
│  [Rooms]  [Items]  [Complete]          │
└────────────────────────────────────────┘
```

---

## Tab 1: Rooms

**Features:**
- Room cards with item count
- "Add Room" button inside tab
- Tap room to select
- Delete room option

**Card Design:**
```
┌──────────────────────────────────┐
│ 🏠 Living Room              [🗑️] │
│ 12 items | 5.2 CBM               │
└──────────────────────────────────┘
```

---

## Tab 2: Items

**Features:**
- Search bar at top
- Item cards with photo option
- Auto-save after each item
- No floating buttons

**Card Design:**
```
┌──────────────────────────────────┐
│ 📦 Sofa Set                      │
│ CBM: 2.5 | Qty: 1                │
│ [📷 Photo] [🗑️ Delete]           │
└──────────────────────────────────┘
```

**Search Flow:**
1. Type item name
2. Suggestions appear
3. Tap to add
4. Item card shows with options

---

## Tab 3: Complete

**Features:**
- Survey summary (items, CBM, rooms)
- Voice note recording (optional, one time)
- Complete button

**Layout:**
```
┌────────────────────────────────────────┐
│  SURVEY SUMMARY                        │
│  📦 Items: 25 | 📏 CBM: 18.5 | 🏠 4    │
│                                        │
│  🎤 Record Voice Note (Optional)       │
│  [● Start Recording]                   │
│                                        │
│  [✅ COMPLETE SURVEY]                  │
└────────────────────────────────────────┘
```

---

## Feedback Popup (After Complete)

**Trigger:** After clicking "Complete Survey"

**Features:**
- QR Code for customer to scan
- WhatsApp button to send feedback link
- Email button to send feedback link

**Popup Design:**
```
┌────────────────────────────────────────┐
│  ✅ Survey Completed!                  │
│                                        │
│  📋 Get Customer Feedback              │
│  ┌────────────────────────────────┐    │
│  │     [QR CODE IMAGE]            │    │
│  │   Customer scan karein         │    │
│  └────────────────────────────────┘    │
│                                        │
│  OR send feedback link via:            │
│  [📱 WhatsApp]  [📧 Email]             │
│                                        │
│  [Close]                               │
└────────────────────────────────────────┘
```

---

## Customer Feedback Form

**Access:** QR Code or WhatsApp/Email link

**Questions:**
1. ⭐ Rating (1-5 stars)
2. 🏷️ Tags (Professional, On-time, Careful, etc.)
3. 📝 Text feedback
4. 👍 Would recommend? (Yes/No)

**Storage:** Save to Supabase `feedback` table

---

## Components to Create/Modify

### New Components:
1. `SurveyTabNavigation.jsx` - Bottom tab bar
2. `RoomsTab.jsx` - Rooms list with cards
3. `ItemsTab.jsx` - Items list with search
4. `CompleteTab.jsx` - Summary + voice note
5. `FeedbackPopup.jsx` - QR + WhatsApp + Email
6. `CustomerFeedbackForm.jsx` - External feedback page

### Modify:
1. `SurveyorSurvey.jsx` - Complete rewrite with tabs
2. `ItemCard.jsx` - Add photo button
3. `RoomTabs.jsx` - Replace with card-based room list

### Remove:
1. `QuickAddInput.jsx` - No longer needed
2. `QuickAddModal.jsx` - No longer needed
3. Floating action buttons

---

## Database Changes

### New Table: `feedback`
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_request_id UUID REFERENCES survey_requests(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[],
  comment TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Add to `survey_requests`:
- `voice_note` (base64 or URL)
- `feedback_sent_via` (whatsapp/email/qr)
- `feedback_sent_at`

---

## Tech Stack

- React + Framer Motion
- Tailwind CSS + CSS Variables
- Supabase (existing)
- QR Code generation library
- WhatsApp API (via link)
- Audio recording (Web Audio API)
