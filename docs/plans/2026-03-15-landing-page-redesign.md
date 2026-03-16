# Q'go Cargo - Landing Page Redesign

## Overview
Complete redesign of the landing page from dark theme to minimal Apple-style clean design with light background and green/orange accents.

## Problem Statement
Current landing page has:
- Dark/boring color scheme
- Outdated visual style
- Weak hero section that doesn't clearly communicate SURVEY tracking (confused with shipment tracking)
- No login button visibility

## Design Decisions

### Style
- **Approach:** Apple-Style Clean (minimal & premium)
- **Background:** Pure white (#FFFFFF) with light gray section breaks (#F9FAFB)
- **Typography:** Inter font family, bold headlines (64-72px), clean body text

### Color Palette
- **Primary Background:** #FFFFFF (white)
- **Secondary Background:** #F9FAFB (light gray)
- **Text Primary:** #0A0A0A (near black)
- **Text Secondary:** #6B7280 (gray)
- **CTA Primary:** Orange gradient (#F59E0B → #D97706)
- **CTA Secondary:** Transparent with border
- **Accent Green:** #10B981 (for icons, success states)

### Key Message
**This is SURVEY tracking, NOT shipment tracking.** Clear communication in hero section.

---

## Page Sections

### 1. Navigation Bar
- Logo: Q'go Cargo (left)
- Links: Features, How It Works, Live Map (center - hidden on mobile)
- Login button (text link style)
- Primary CTA: "Request Survey" (right)

### 2. Hero Section
**Layout:** 2-column (50/50)
- **Left Column (Text):**
  - Badge: "Kuwait's #1 Survey Platform" (optional)
  - Headline: "Track Your Home Survey in Real-Time"
  - Subtext: "Book a free home survey. Watch your surveyor arrive on the map. Get instant CBM report."
  - Primary CTA: "Start Free Survey" (orange gradient)
  - Secondary CTA: "Track Your Survey →" (link style)

- **Right Column (Map Preview):**
  - Interactive mini map with Google Maps tiles
  - Surveyor marker with pulse animation
  - Customer location pin
  - Status overlay: "📍 Surveyor en route • ⏱ ETA: 12 mins"

- **Trust badges below:** "Trusted by 50+ relocation companies"

### 3. Social Proof Section
- Background: Light gray (#F9FAFB)
- Text: "Trusted by Kuwait's leading relocation companies"
- Client logos: Grayscale with hover color, horizontal row
- Compact padding (py-12)

### 4. Features Grid
**Layout:** 3 columns (desktop), 2 (tablet), 1 (mobile)

| Feature | Icon (lucide-react) | Description |
|---------|---------------------|-------------|
| 5-Step Wizard | `Wand2` | Easy booking wizard for customers |
| Live GPS Tracking | `MapPin` | Watch your surveyor live on map |
| Smart CBM Calculator | `Calculator` | 200+ items with auto-calculation |
| Container Recommender | `Ship` | LCL to 40'HC suggestions |
| Branded PDF Reports | `FileText` | One-click professional reports |
| Multi-Role Access | `Shield` | Admin, Surveyor, Customer portals |

**Card Design:**
- White background
- Subtle shadow
- Rounded corners (rounded-2xl)
- Hover lift effect
- Green icon container

### 5. Live Map Demo
**Layout:** 2-column (60/40 - map heavy)

- **Left (Map):**
  - Google Maps tiles via Leaflet
  - Animated surveyor marker (green pulse)
  - Customer home pin
  - Dashed green route line
  - Rounded corners, shadow

- **Right (Content):**
  - Title: "Watch Your Surveyor Arrive in Real-Time"
  - Description: "Get a unique tracking link when you book. No app download needed."
  - Feature list with checkmarks
  - CTA: "Try Live Demo"

---

## Technical Notes

### Map Implementation
- Use Leaflet with Google Maps tiles
- Package: `react-leaflet` + Google Maps layer
- Custom markers with pulse animation (CSS)

### Icons
- Use `lucide-react` (already in dependencies)
- Icons: Wand2, MapPin, Calculator, Ship, FileText, Shield

### Animations
- Framer Motion for:
  - Hero text fade-in
  - Feature cards hover lift
  - Map marker pulse
  - Scroll reveal animations

### Responsive
- Mobile: Single column, stacked sections
- Tablet: 2-column grids
- Desktop: Full layout as designed

---

## File Changes Required

1. **New file:** `src/pages/NewLandingPage.jsx` - Complete new component
2. **Update:** `src/App.jsx` - Route to new landing page
3. **Possible update:** `src/index.css` - Add new utility classes if needed

## Success Criteria
- [ ] Clear communication of SURVEY tracking (not shipment)
- [ ] Login button visible in navbar
- [ ] Google Maps tiles in Leaflet map
- [ ] Real icons (lucide-react), no emojis
- [ ] Light, clean, premium aesthetic
- [ ] Orange gradient CTAs
- [ ] Mobile responsive
