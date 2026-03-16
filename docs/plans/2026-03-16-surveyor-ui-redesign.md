# Surveyor UI Redesign - Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete overhaul of Surveyor mobile interface with modern Mobile-First design (Uber/WhatsApp style), featuring auto theme, top tabs navigation, and enhanced features.

**Architecture:** React components with Tailwind CSS, using existing Supabase backend. New features: offline support with IndexedDB, real-time sync with WebSocket, voice/photo attachments per item.

**Tech Stack:** React, Tailwind CSS, Framer Motion (animations), IndexedDB (offline), Supabase Realtime

---

## Design Specifications

### Theme
- **Auto Theme:** Light/Dark based on system preference (`prefers-color-scheme`)
- **Primary Color:** CSS variable `--color-primary` from branding settings
- **Background:** White/Dark gray with subtle gradients

### Navigation
- **Top Tabs:** Dashboard | Surveys | Map | Settings
- **Floating Action Button (FAB):** Quick add item

### Typography
- **Font:** Inter (existing)
- **Sizes:** sm (12px), base (14px), lg (16px), xl (18px), 2xl (24px)

---

## Components Structure

```
src/pages/surveyor/
├── SurveyorLayout.jsx      # Main layout with header + tabs
├── SurveyorDashboard.jsx   # Home tab with stats + today's surveys
├── SurveyorSurveys.jsx     # Surveys list tab
├── SurveyorMap.jsx         # Map view tab
├── SurveyorSettings.jsx    # Settings tab (theme, sync, profile)
├── SurveyorSurvey.jsx      # Active survey detail page
└── components/
    ├── QuickAddModal.jsx   # Fast item addition with search/voice/scan
    ├── ItemCard.jsx        # Item display with photo/voice buttons
    ├── RoomTabs.jsx        # Horizontal scrollable room tabs
    ├── CBMCounter.jsx      # Animated CBM progress display
    ├── VoiceRecorder.jsx   # Voice note recording component
    ├── PhotoGallery.jsx    # Photo attachment component
    ├── OfflineIndicator.jsx # Sync status indicator
    └── SurveyCard.jsx      # Survey preview card
```

---

## Features

### 1. Quick Item Add
- Search bar with instant filtering
- Barcode/QR scan button (camera API)
- Popular items grid (frequently used)
- Category tabs
- Voice input ("Add a brown leather sofa")
- Custom item creation

### 2. Voice & Photos
- Each item can have multiple photos
- Voice notes per item (max 60 seconds)
- Photo thumbnails in item list
- Voice playback in item detail

### 3. Offline Mode
- Service worker for caching
- IndexedDB for local data storage
- Background sync when online
- Visual indicator for sync status
- Queue operations when offline

### 4. Real-time Updates
- Supabase Realtime for survey status changes
- WebSocket connection for instant notifications
- Live CBM updates across devices
- Survey assignment notifications

---

## UI Layouts

### Dashboard Tab
- Greeting with surveyor name
- 3 stat cards (Active, Done, Today)
- Today's surveys list with time slots
- Quick action buttons (Photo, Voice, Item)

### Surveys Tab
- Filter chips (All, Active, Completed, Cancelled)
- Search bar
- Survey cards with status, customer, address, date
- Pull to refresh

### Map Tab
- Full-screen map with survey markers
- User's current location
- Route optimization
- List of today's surveys below map
- Navigate/Call buttons

### Settings Tab
- Profile section (name, phone, photo)
- Theme toggle (Auto/Light/Dark)
- Sync status
- Offline data management
- Notifications toggle
- Logout button

### Survey Detail Page
- Header with reference number and sync status
- Route info card (From → To)
- Container selection with AI recommendation
- CBM progress bar with animation
- GPS tracking toggle
- Room tabs (horizontal scroll)
- Item list with photo/voice/edit buttons
- Add item FAB
- Complete survey button

---

## Database Changes

### New Tables

```sql
-- Item attachments
CREATE TABLE item_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_item_id UUID REFERENCES survey_items(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('photo', 'voice')),
  file_url TEXT NOT NULL,
  duration_seconds INT, -- for voice notes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offline sync queue
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surveyor_id UUID REFERENCES surveyors(id),
  operation TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  data JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);
```

---

## Implementation Tasks

### Task 1: Create Base Layout
- New SurveyorLayout with top tabs
- Auto theme support (CSS variables)
- Header component with profile

### Task 2: Dashboard Tab
- Stats cards with animations
- Today's surveys list
- Quick action buttons

### Task 3: Surveys Tab
- Filter chips
- Search functionality
- Survey cards with status

### Task 4: Map Tab
- Leaflet map with markers
- User location
- Route list with actions

### Task 5: Settings Tab
- Profile section
- Theme toggle
- Sync management

### Task 6: Survey Detail Redesign
- New layout with cards
- Room tabs component
- CBM counter with animation

### Task 7: Quick Add Modal
- Search with filters
- Popular items
- Category tabs
- Voice input integration

### Task 8: Voice & Photo Attachments
- Voice recorder component
- Photo gallery component
- Attachment display in items

### Task 9: Offline Support
- Service worker setup
- IndexedDB integration
- Sync queue management

### Task 10: Real-time Updates
- Supabase Realtime subscriptions
- Notification system
- Live status updates

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/surveyor/SurveyorLayout.jsx` | Rewrite - New layout with tabs |
| `src/pages/surveyor/SurveyorDashboard.jsx` | Rewrite - New dashboard design |
| `src/pages/surveyor/SurveyorSurveys.jsx` | Create - Surveys list tab |
| `src/pages/surveyor/SurveyorMap.jsx` | Create - Map view tab |
| `src/pages/surveyor/SurveyorSettings.jsx` | Create - Settings tab |
| `src/pages/surveyor/SurveyorSurvey.jsx` | Rewrite - New survey detail |
| `src/pages/surveyor/components/QuickAddModal.jsx` | Create |
| `src/pages/surveyor/components/ItemCard.jsx` | Create |
| `src/pages/surveyor/components/RoomTabs.jsx` | Create |
| `src/pages/surveyor/components/CBMCounter.jsx` | Create |
| `src/pages/surveyor/components/VoiceRecorder.jsx` | Create |
| `src/pages/surveyor/components/PhotoGallery.jsx` | Create |
| `src/pages/surveyor/components/OfflineIndicator.jsx` | Create |
| `src/pages/surveyor/components/SurveyCard.jsx` | Create |
| `src/hooks/useOfflineSync.js` | Create - Offline sync hook |
| `src/hooks/useTheme.js` | Create - Theme management |
| `src/App.jsx` | Modify - Update routes |
| `src/index.css` | Modify - Add dark theme variables |
| `migrations/item_attachments.sql` | Create - Database migration |

---

## Verification Steps

1. Login as surveyor (`surveyor@qgocargo.com` / `demo123`)
2. Verify dashboard shows stats and today's surveys
3. Check top tabs navigation works
4. Open a survey, verify new layout
5. Test adding items with search
6. Test room tabs scrolling
7. Verify CBM counter updates live
8. Test theme toggle in settings
9. Check offline indicator shows when disconnected
10. Verify data syncs when back online
