# Landing Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the existing dark landing page with a minimal Apple-style clean design featuring light background, real icons, Google Maps tiles, and clear SURVEY tracking messaging.

**Architecture:** Single-page React component with Framer Motion animations, Leaflet map with Google Maps tiles, Lucide icons, and responsive Tailwind styling. Built as a new component to preserve the existing page during development.

**Tech Stack:** React, Tailwind CSS, Framer Motion, Leaflet + react-leaflet, Lucide React icons

---

## Prerequisites

- Node modules already installed
- Project running on Vite dev server
- Existing dependencies: react-leaflet, framer-motion, lucide-react, tailwindcss

---

### Task 1: Create Landing Page Component Structure

**Files:**
- Create: `src/pages/NewLandingPage.jsx`

**Step 1: Create the base component file with imports**

```jsx
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  Wand2,
  MapPin,
  Calculator,
  Ship,
  FileText,
  Shield,
  ChevronRight,
  Play,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react'

export default function NewLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Content will be added */}
    </div>
  )
}
```

**Step 2: Verify file created**

Run: Check file exists at `src/pages/NewLandingPage.jsx`

**Step 3: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: create NewLandingPage component skeleton"
```

---

### Task 2: Create Custom Leaflet Markers

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add custom marker icons after imports**

Add this code after the imports, before the component:

```jsx
// Custom Leaflet Markers for Light Theme
const surveyorIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:44px;height:44px">
      <div style="width:44px;height:44px;background:#10B981;border-radius:50%;border:3px solid white;box-shadow:0 4px 16px rgba(16,185,129,0.4);display:flex;align-items:center;justify-content:center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
        </svg>
      </div>
      <div style="position:absolute;top:-8px;right:-4px;width:14px;height:14px;background:#10B981;border-radius:50%;border:2px solid white;animation:pulse 2s infinite"></div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
})

const homeIcon = L.divIcon({
  className: '',
  html: `
    <div style="width:40px;height:40px;background:#6366F1;border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(99,102,241,0.35);display:flex;align-items:center;justify-content:center">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add custom leaflet markers for surveyor and home"
```

---

### Task 3: Create Moving Marker Component

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add MovingMarker component before main component**

```jsx
// Animated moving marker
function MovingMarker({ from, to }) {
  const [pos, setPos] = useState(from)
  const stepRef = useRef(0)

  useEffect(() => {
    const steps = 80
    const latD = (to[0] - from[0]) / steps
    const lngD = (to[1] - from[1]) / steps
    const id = setInterval(() => {
      stepRef.current++
      if (stepRef.current >= steps - 4) stepRef.current = 0
      setPos(p => [p[0] + latD, p[1] + lngD])
    }, 900)
    return () => clearInterval(id)
  }, [from, to])

  return (
    <Marker position={pos} icon={surveyorIcon}>
      <Popup>
        <b>Mohammed Al-Rashid</b><br />
        Surveyor · GPS Active
      </Popup>
    </Marker>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add animated moving marker component"
```

---

### Task 4: Create Animation Utilities

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add animation variants and Reveal component**

```jsx
// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
}

// Scroll reveal wrapper
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add animation utilities and Reveal component"
```

---

### Task 5: Create Features Data

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add features data array**

```jsx
// Features data
const FEATURES = [
  {
    icon: Wand2,
    title: '5-Step Survey Wizard',
    desc: 'Customers submit requests through an easy step-by-step wizard with instant reference number.',
    color: '#8B5CF6'
  },
  {
    icon: MapPin,
    title: 'Live GPS Tracking',
    desc: 'Unique tracking link per survey. Watch your surveyor move live on an interactive map.',
    color: '#10B981'
  },
  {
    icon: Calculator,
    title: 'Smart CBM Calculator',
    desc: '200+ pre-loaded furniture items with default dimensions. Auto-calculate CBM instantly.',
    color: '#F59E0B'
  },
  {
    icon: Ship,
    title: 'Container Engine',
    desc: 'Recommends LCL, Groupage, 20ft or 40ft HC containers with fill visualization.',
    color: '#3B82F6'
  },
  {
    icon: FileText,
    title: 'Branded PDF Reports',
    desc: 'One-click branded reports with room breakdown, CBM totals, ready to email.',
    color: '#EC4899'
  },
  {
    icon: Shield,
    title: 'Multi-Role Access',
    desc: 'Admin, Surveyor, Customer portals with proper permissions and security.',
    color: '#06B6D4'
  },
]

// Map coordinates for demo
const SURVEYOR_START = [29.390, 47.960]
const CUSTOMER_POS = [29.362, 47.993]
const MAP_CENTER = [29.376, 47.976]
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add features data and map coordinates"
```

---

### Task 6: Build Navigation Bar

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add navigation component inside NewLandingPage**

Add this at the start of the return statement:

```jsx
export default function NewLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const unsub = scrollY.on('change', v => setNavScrolled(v > 60))
    return () => unsub()
  }, [scrollY])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-300 ${
          navScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-emerald-500 text-white font-black text-lg px-2.5 py-1 rounded-lg">Q</div>
          <span className="font-bold text-xl text-gray-900">
            Q'go <span className="text-emerald-500">Cargo</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-emerald-500 transition-colors font-medium text-sm">Features</a>
          <a href="#live-map" className="text-gray-600 hover:text-emerald-500 transition-colors font-medium text-sm">Live Map</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-emerald-500 transition-colors font-medium text-sm">How It Works</a>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-gray-700 hover:text-emerald-500 font-medium text-sm transition-colors">
            Login
          </Link>
          <Link
            to="/survey"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Request Survey
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col gap-4">
            <a href="#features" className="text-gray-700 font-medium py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#live-map" className="text-gray-700 font-medium py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Live Map</a>
            <a href="#how-it-works" className="text-gray-700 font-medium py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <Link to="/login" className="text-gray-700 font-medium py-3 border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link to="/survey" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-center py-3 rounded-full mt-4">
              Request Survey
            </Link>
          </div>
        </motion.div>
      )}

      {/* Rest of content will go here */}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add responsive navigation bar with mobile menu"
```

---

### Task 7: Build Hero Section

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add Hero section after navigation (replace the comment)**
```jsx
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50 opacity-60" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-full mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Kuwait's #1 Survey Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl xl:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6"
            >
              Track Your<br />
              <span className="text-emerald-500">Home Survey</span><br />
              in Real-Time
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8 max-w-lg"
            >
              Book a free home survey. Watch your surveyor arrive on the map.
              Get instant CBM report. No app download needed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/survey"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-full text-base transition-all hover:shadow-xl hover:-translate-y-1"
              >
                Start Free Survey
              </Link>
              <a
                href="#live-map"
                className="flex items-center gap-2 text-gray-700 hover:text-emerald-500 font-semibold px-6 py-4 rounded-full border border-gray-200 hover:border-emerald-300 transition-all"
              >
                <Play className="w-5 h-5" />
                Track Your Survey
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-6 mt-10 pt-10 border-t border-gray-100"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                2400+ Surveys
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                98% Satisfaction
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                200+ Items
              </div>
            </motion.div>
          </div>

          {/* Right - Mini Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <MapContainer
                center={MAP_CENTER}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
                zoomControl={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  subdomains={['mt0','mt1','mt2','mt3']}
                  attribution="© Google Maps"
                />
                <MovingMarker from={SURVEYOR_START} to={CUSTOMER_POS} />
                <Marker position={CUSTOMER_POS} icon={homeIcon}>
                  <Popup>
                    <b>Survey Destination</b><br />
                    Salmiya, Block 5
                  </Popup>
                </Marker>
                <Polyline
                  positions={[SURVEYOR_START, CUSTOMER_POS]}
                  color="#10B981"
                  weight={3}
                  dashArray="10 6"
                  opacity={0.7}
                />
              </MapContainer>
            </div>

            {/* Floating status card */}
            <div className="absolute -bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Surveyor En Route</div>
                    <div className="text-gray-500 text-xs">GPS Active · Real-time updates</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-500">12 min</div>
                  <div className="text-gray-400 text-xs">ETA</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add hero section with live map preview"
```

---

### Task 8: Build Social Proof Section

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add Social Proof section after Hero**
```jsx
      {/* Social Proof */}
      <section className="bg-gray-50 py-12 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <p className="text-center text-gray-500 text-sm mb-8">
            Trusted by Kuwait's leading relocation companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Agility Logistics', 'Gulf Warehousing', 'Kuwait Movers', 'Fast Track Cargo', 'Al-Rashed'].map((name, i) => (
              <div
                key={name}
                className="text-gray-400 font-semibold text-sm md:text-base opacity-60 hover:opacity-100 transition-opacity cursor-default"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add social proof section with company names"
```

---

### Task 9: Build Features Grid Section

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add Features section after Social Proof**
```jsx
      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="text-center mb-16">
            <span className="text-emerald-500 font-semibold text-sm uppercase tracking-widest">
              Platform Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4 tracking-tight">
              Everything You Need<br />to Run Modern Surveys
            </h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              From customer request to final report — one platform handles it all.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Reveal key={feature.title} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -8, shadow: '0 25px 50px rgba(0,0,0,0.1)' }}
                    className="group bg-white border border-gray-100 rounded-2xl p-8 hover:border-gray-200 hover:shadow-xl transition-all h-full"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: feature.color }} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      {feature.desc}
                    </p>
                  </motion.div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add features grid with lucide icons"
```

---

### Task 10: Build Live Map Demo Section

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add Live Map section after Features**
```jsx
      {/* Live Map Demo */}
      <section id="live-map" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Map */}
            <Reveal className="lg:col-span-3">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
                <MapContainer
                  center={MAP_CENTER}
                  zoom={13}
                  style={{ height: '480px', width: '100%' }}
                  zoomControl={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={['mt0','mt1','mt2','mt3']}
                    attribution="© Google Maps"
                  />
                  <MovingMarker from={SURVEYOR_START} to={CUSTOMER_POS} />
                  <Marker position={CUSTOMER_POS} icon={homeIcon}>
                    <Popup>
                      <b>Survey Destination</b><br />
                      Salmiya, Block 5<br />
                      <small>Confirmed: 10:00 AM</small>
                    </Popup>
                  </Marker>
                  <Polyline
                    positions={[SURVEYOR_START, CUSTOMER_POS]}
                    color="#10B981"
                    weight={3}
                    dashArray="10 6"
                    opacity={0.7}
                  />
                </MapContainer>
              </div>
            </Reveal>

            {/* Content */}
            <Reveal delay={0.2} className="lg:col-span-2">
              <span className="text-emerald-500 font-semibold text-sm uppercase tracking-widest">
                Live GPS Demo
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4 tracking-tight">
                Watch Your Surveyor<br />Arrive in Real-Time
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Get a unique tracking link when you book. No app download needed.
                The map updates every few seconds as the surveyor travels.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: MapPin, title: 'Live Location', desc: 'GPS updates in real-time' },
                  { icon: '🏠', title: 'Property Pin', desc: 'Destination clearly marked' },
                  { icon: '⏱️', title: 'ETA Updates', desc: 'Know when they arrive' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      {typeof item.icon === 'string' ? (
                        <span className="text-lg">{item.icon}</span>
                      ) : (
                        <item.icon className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-gray-500 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/survey"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-full transition-all hover:shadow-lg"
              >
                Try Live Demo
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add live map demo section with Google Maps tiles"
```

---

### Task 11: Build How It Works Section

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add How It Works section after Live Map**
```jsx
      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Reveal className="text-center mb-16">
            <span className="text-emerald-500 font-semibold text-sm uppercase tracking-widest">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4 tracking-tight">
              From Request to Report<br />in 4 Easy Steps
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200" />

            {[
              { n: '01', title: 'Book Survey', desc: 'Fill the 5-step wizard. Get instant reference number.' },
              { n: '02', title: 'Surveyor Assigned', desc: 'Operations team assigns surveyor. You get notified.' },
              { n: '03', title: 'Live Tracking', desc: 'Watch surveyor arrive. Items recorded room-by-room.' },
              { n: '04', title: 'Get Report', desc: 'Branded PDF with CBM & container recommendation.' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1} className="text-center relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-5 shadow-lg relative z-10"
                >
                  {step.n}
                </motion.div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add how it works section with 4 steps"
```

---

### Task 12: Build CTA and Footer Sections

**Files:**
- Modify: `src/pages/NewLandingPage.jsx`

**Step 1: Add CTA section after How It Works**
```jsx
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight">
              Ready to Transform<br />Your Survey Operations?
            </h2>
            <p className="text-emerald-100 text-lg mb-10">
              Request your first survey in under 2 minutes. No account needed.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/survey"
                className="bg-white text-emerald-600 font-bold px-10 py-4 rounded-full text-base hover:bg-gray-100 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                Start Free Survey Now
              </Link>
              <a
                href="#features"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full text-base hover:bg-white/10 transition-all"
              >
                Explore Features
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-500 text-white font-black text-lg px-2.5 py-1 rounded-lg">Q</div>
                <span className="font-bold text-xl text-white">
                  Q'go <span className="text-emerald-400">Cargo</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Kuwait's logistics survey management platform. Built for modern relocation companies.
              </p>
            </div>

            {[
              { title: 'Platform', links: ['Features', 'Live Map', 'Request Survey'] },
              { title: 'Portals', links: ['Admin', 'Surveyor', 'Customer'] },
              { title: 'Contact', links: ['Support', 'About Us', 'Privacy'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-300 mb-5">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
            <span>© 2026 Q'go Cargo. All rights reserved.</span>
            <span>Kuwait City, Kuwait 🇰🇼</span>
          </div>
        </div>
      </footer>
```

**Step 2: Commit**

```bash
git add src/pages/NewLandingPage.jsx
git commit -m "feat: add CTA and footer sections"
```

---

### Task 13: Update App Routes

**Files:**
- Modify: `src/App.jsx`

**Step 1: Import NewLandingPage and update route**

Change the import and route:

```jsx
// At top, change import
import NewLandingPage from '@/pages/NewLandingPage'

// Change the route
<Route path="/" element={<NewLandingPage />} />
```

Full changes to `src/App.jsx`:

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// Pages
import NewLandingPage      from '@/pages/NewLandingPage'  // Changed from LandingPage
import LoginPage          from '@/pages/LoginPage'
// ... rest of imports stay same
```

And in Routes:
```jsx
<Route path="/" element={<NewLandingPage />} />  // Changed
```

**Step 2: Verify changes**

Run: `npm run dev` and check http://localhost:5174/ shows new landing page

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: switch to NewLandingPage as default landing"
```

---

### Task 14: Add Leaflet CSS Styles

**Files:**
- Modify: `src/index.css`

**Step 1: Add Leaflet customizations for light theme**

Add to the end of `src/index.css`:

```css
/* Leaflet Map Customizations - Light Theme */
.leaflet-container {
  font-family: 'Inter', sans-serif;
}

.leaflet-popup-content-wrapper {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.leaflet-popup-content {
  margin: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
}

.leaflet-control-attribution {
  background: rgba(255,255,255,0.8) !important;
  font-size: 10px;
}

/* Pulse animation for markers */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}
```

**Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: add leaflet custom styles for light theme"
```

---

### Task 15: Final Verification

**Step 1: Run dev server and test all sections**

```bash
npm run dev
```

**Step 2: Verify checklist**
- [ ] Navigation visible with Login button
- [ ] Hero section shows with live map
- [ ] Social proof section displays
- [ ] Features grid with lucide icons
- [ ] Live map demo works with Google tiles
- [ ] How it works section displays
- [ ] CTA section with gradient background
- [ ] Footer displays correctly
- [ ] Mobile responsive (resize browser)
- [ ] All links work

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete landing page redesign - Apple-style clean design with light theme"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create component structure | NewLandingPage.jsx |
| 2 | Custom leaflet markers | NewLandingPage.jsx |
| 3 | Moving marker animation | NewLandingPage.jsx |
| 4 | Animation utilities | NewLandingPage.jsx |
| 5 | Features data | NewLandingPage.jsx |
| 6 | Navigation bar | NewLandingPage.jsx |
| 7 | Hero section | NewLandingPage.jsx |
| 8 | Social proof | NewLandingPage.jsx |
| 9 | Features grid | NewLandingPage.jsx |
| 10 | Live map demo | NewLandingPage.jsx |
| 11 | How it works | NewLandingPage.jsx |
| 12 | CTA & Footer | NewLandingPage.jsx |
| 13 | Update routes | App.jsx |
| 14 | Leaflet styles | index.css |
| 15 | Final verification | - |

---

## Notes

- Google Maps tiles may require API key in production. For demo, using free tiles.
- Old LandingPage.jsx is preserved as backup
- Design is mobile-responsive with Tailwind breakpoints
