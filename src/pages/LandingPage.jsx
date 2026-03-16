import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

// ─── Leaflet marker icons ───────────────────────────────────────────────────
const surveyorIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:44px;height:44px">
    <div style="width:44px;height:44px;background:#0D5C9E;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.4)"></div>
    <span style="position:absolute;top:9px;left:9px;font-size:18px;transform:rotate(45deg);line-height:1">👷</span>
    <span style="position:absolute;top:-6px;left:14px;width:16px;height:16px;background:#00C8F0;border-radius:50%;border:2px solid white;display:block"></span>
  </div>`,
  iconSize: [44, 44], iconAnchor: [22, 44],
})
const homeIcon = L.divIcon({
  className: '',
  html: `<div style="width:38px;height:38px;background:#27AE60;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.35)">🏠</div>`,
  iconSize: [38, 38], iconAnchor: [19, 19],
})

// animate surveyor along route
function MovingMarker({ from, to }) {
  const [pos, setPos] = useState(from)
  const stepRef = useRef(0)
  const map = useMap()
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
  }, [])
  return (
    <Marker position={pos} icon={surveyorIcon}>
      <Popup><b>Mohammed Al-Rashid</b><br />Surveyor · GPS Active 🟢</Popup>
    </Marker>
  )
}

// ─── Counter hook ────────────────────────────────────────────────────────────
function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const id = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(id) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(id)
  }, [inView, target])
  return { count, ref }
}

// ─── Ship SVG ─────────────────────────────────────────────────────────────
function ShipIllustration() {
  return (
    <motion.svg
      viewBox="0 0 560 320" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-xl"
      animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Water */}
      <motion.path
        d="M0 210 Q70 193 140 210 Q210 227 280 210 Q350 193 420 210 Q490 227 560 210 L560 320 L0 320Z"
        fill="rgba(13,92,158,0.25)"
        animate={{ d: [
          "M0 210 Q70 193 140 210 Q210 227 280 210 Q350 193 420 210 Q490 227 560 210 L560 320 L0 320Z",
          "M0 218 Q70 201 140 218 Q210 235 280 218 Q350 201 420 218 Q490 235 560 218 L560 320 L0 320Z",
          "M0 210 Q70 193 140 210 Q210 227 280 210 Q350 193 420 210 Q490 227 560 210 L560 320 L0 320Z",
        ]}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M0 222 Q90 205 180 222 Q270 239 360 222 Q450 205 560 222 L560 320 L0 320Z"
        fill="rgba(13,92,158,0.45)"
        animate={{ d: [
          "M0 222 Q90 205 180 222 Q270 239 360 222 Q450 205 560 222 L560 320 L0 320Z",
          "M0 228 Q90 211 180 228 Q270 245 360 228 Q450 211 560 228 L560 320 L0 320Z",
          "M0 222 Q90 205 180 222 Q270 239 360 222 Q450 205 560 222 L560 320 L0 320Z",
        ]}}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      {/* Hull */}
      <path d="M70 205 L490 205 L468 235 L92 235Z" fill="#083D6E" />
      <path d="M92 235 L468 235 L460 245 L100 245Z" fill="#062B50" />
      {/* Deck */}
      <rect x="110" y="155" width="340" height="52" rx="4" fill="#0A1F3E" />
      {/* Containers row 1 */}
      {['#0D5C9E','#27AE60','#E67E22','#E74C3C','#8E44AD'].map((c, i) => (
        <rect key={i} x={120 + i * 64} y="163" width="58" height="40" rx="3" fill={c} opacity="0.9" />
      ))}
      {/* Containers row 2 (partial) */}
      {['#1A7FC1','#2ECC71'].map((c, i) => (
        <rect key={i} x={120 + i * 64} y="122" width="58" height="42" rx="3" fill={c} opacity="0.85" />
      ))}
      {/* Bridge / Cabin */}
      <rect x="400" y="105" width="70" height="102" rx="5" fill="#061424" />
      <rect x="412" y="117" width="14" height="12" rx="2" fill="rgba(0,200,240,0.7)" />
      <rect x="432" y="117" width="14" height="12" rx="2" fill="rgba(0,200,240,0.7)" />
      <rect x="412" y="135" width="14" height="10" rx="2" fill="rgba(0,200,240,0.4)" />
      <rect x="432" y="135" width="14" height="10" rx="2" fill="rgba(0,200,240,0.4)" />
      {/* Mast */}
      <line x1="435" y1="45" x2="435" y2="106" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" />
      <line x1="395" y1="68" x2="475" y2="68" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      {/* GPS ping */}
      <motion.circle cx="435" cy="45" r="5" fill="#00C8F0"
        animate={{ r: [5, 14, 5], opacity: [1, 0, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <circle cx="435" cy="45" r="4" fill="#00C8F0" />
      {/* Route dashes to horizon */}
      <motion.path d="M490 218 Q520 195 555 180" stroke="#00C8F0" strokeWidth="2"
        strokeDasharray="8 5" opacity="0.4"
        animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Stars */}
      {[[40, 35],[500, 25],[530, 70],[20, 90],[470, 90]].map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r={1.5}
          fill={i % 2 === 0 ? 'rgba(0,200,240,0.5)' : 'rgba(255,255,255,0.35)'}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </motion.svg>
  )
}

// ─── Floating Badge ──────────────────────────────────────────────────────────
function FloatingBadge({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={`absolute bg-[#0A1628]/90 border border-[#00C8F0]/25 rounded-2xl p-4 backdrop-blur-xl shadow-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{ opacity: { duration: 0.6, delay }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay } }}
    >
      {children}
    </motion.div>
  )
}

// ─── Section Reveal ──────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─── FEATURES data ──────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🧙', title: '5-Step Survey Wizard', desc: 'Customers submit requests through a silky animated wizard — step-by-step, no confusion, instant reference number.' },
  { icon: '📡', title: 'Real-Time GPS Tracking', desc: 'Unique tracking link per survey. Watch your surveyor move live on an interactive OpenStreetMap — no Google Maps fees.' },
  { icon: '📦', title: 'CBM Calculator', desc: '200+ pre-loaded furniture items with default dimensions. Tap to add, quantities auto-calculate CBM on the fly.' },
  { icon: '🚢', title: 'Container Engine', desc: 'Recommends LCL, Groupage, 20ft or 40ft HC containers with animated fill visualization.' },
  { icon: '📄', title: 'Branded PDF Reports', desc: 'One-click branded reports with room breakdown, CBM totals, container recommendation — ready to email.' },
  { icon: '🔐', title: 'Multi-Role Access', desc: 'Super Admin, Ops Manager, Surveyor, Customer — each with their own portal and RLS-enforced permissions.' },
]

const STEPS = [
  { n: '01', title: 'Customer Submits', desc: 'Fills the 5-step wizard. Gets instant reference number and confirmation email.' },
  { n: '02', title: 'Ops Assigns',     desc: 'Operations manager assigns a surveyor and confirms the date. Customer gets notified.' },
  { n: '03', title: 'Surveyor Visits', desc: 'Room-wise item entry on tablet. Customer watches live on map. CBM updates in real-time.' },
  { n: '04', title: 'Report Delivered', desc: 'Auto-generated branded PDF with container recommendation, emailed to customer.' },
]

// ─── CONTAINERS data ─────────────────────────────────────────────────────────
const CONTAINERS = [
  { type: 'LCL',       cbm: '4.25',  fill: 45, color: '#6B7280' },
  { type: 'Groupage',  cbm: '12.75', fill: 30, color: '#8B5CF6' },
  { type: "20' Std",   cbm: '28.2',  fill: 65, color: '#0D5C9E', best: true },
  { type: "20' HC",    cbm: '31.7',  fill: 55, color: '#1D78C4' },
  { type: "40' Std",   cbm: '57.5',  fill: 80, color: '#27AE60' },
  { type: "40' HC",    cbm: '64.9',  fill: 70, color: '#2ECC71' },
]

// ─── MAP coords ──────────────────────────────────────────────────────────────
const SURVEYOR_START = [29.390, 47.960]
const CUSTOMER_POS   = [29.362, 47.993]

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const [selectedContainer, setSelectedContainer] = useState(2)
  const [navScrolled, setNavScrolled] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const unsub = scrollY.on('change', v => setNavScrolled(v > 60))
    return () => unsub()
  }, [])

  const c1 = useCounter(2400)
  const c2 = useCounter(98)
  const c3 = useCounter(200)
  const c4 = useCounter(15)

  return (
    <div className="min-h-screen bg-[#060E1E] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .hero-grid {
          background-image: linear-gradient(rgba(0,200,240,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,200,240,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMove 18s linear infinite;
        }
        @keyframes gridMove { 0%{background-position:0 0} 100%{background-position:0 60px} }
        .ping-ring::after {
          content:''; position:absolute; inset:-6px; border-radius:50%;
          border:2px solid #00C8F0; animation: ping 2s infinite;
        }
        @keyframes ping { 0%{opacity:.8;transform:scale(1)} 100%{opacity:0;transform:scale(2.2)} }
        .leaflet-container { background: #0A1628 !important; }
      `}</style>

      {/* ── NAVBAR ── */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-300 ${
          navScrolled ? 'bg-[#060E1E]/95 backdrop-blur-xl border-b border-[#00C8F0]/10 shadow-2xl' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="bg-[#00C8F0] text-[#060E1E] syne font-black text-sm px-2.5 py-1 rounded-lg">Q</div>
          <span className="syne font-bold text-lg">Q'go <span className="text-[#00C8F0]">Cargo</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features','How It Works','Live Map'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
               className="text-sm text-slate-400 hover:text-[#00C8F0] transition-colors font-medium">
              {l}
            </a>
          ))}
        </div>
        <Link to="/survey"
          className="bg-[#00C8F0] hover:bg-white text-[#060E1E] syne font-bold text-sm px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg">
          Request Survey →
        </Link>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 hero-grid" />
        <div className="absolute inset-0 bg-radial-[ellipse_70%_60%_at_65%_40%] from-[#0D5C9E]/20 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#00C8F0]/10 border border-[#00C8F0]/30 text-[#00C8F0] text-xs font-semibold px-4 py-2 rounded-full mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C8F0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C8F0]"></span>
              </span>
              Kuwait's Logistics Survey Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="syne text-5xl md:text-6xl xl:text-7xl font-black leading-[1.03] tracking-tight mb-6"
            >
              Smart Surveys<br />
              for <span className="text-[#00C8F0]">Modern</span><br />
              <span style={{ WebkitTextStroke: '1.5px #00C8F0', color: 'transparent' }}>Relocation</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-lg font-light leading-relaxed mb-10 max-w-md"
            >
              End-to-end survey management — from customer request to branded PDF report. Real-time GPS tracking, CBM calculation & intelligent container recommendations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/survey"
                className="bg-[#00C8F0] hover:bg-white text-[#060E1E] syne font-bold px-8 py-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(0,200,240,0.4)] text-base">
                Request Free Survey
              </Link>
              <a href="#live-map"
                className="border border-white/20 hover:border-[#00C8F0] text-white hover:text-[#00C8F0] syne font-semibold px-8 py-4 rounded-2xl transition-all text-base">
                See Live Tracking ↓
              </a>
            </motion.div>

            {/* Mini stats */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="flex gap-8 mt-12"
            >
              {[['2400+','Surveys Done'],['98%','Satisfaction'],['200+','Items Library']].map(([n,l]) => (
                <div key={l}>
                  <div className="syne font-black text-2xl text-[#00C8F0]">{n}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — ship + badges */}
          <motion.div
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
            className="relative hidden lg:flex justify-center"
          >
            <ShipIllustration />
            <FloatingBadge className="top-0 right-4 w-52" delay={0.8}>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Live Survey</div>
              <div className="syne font-black text-2xl text-[#00C8F0]">42.3 <span className="text-sm font-normal text-slate-400">CBM</span></div>
              <div className="text-xs text-slate-400 mt-1">40' HC Container Recommended</div>
            </FloatingBadge>
            <FloatingBadge className="bottom-16 -left-4 w-48" delay={1.1}>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Surveyor</div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0"></span>
                <span className="syne font-bold text-sm text-green-400">En Route</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">ETA: 8 min · GPS Active</div>
            </FloatingBadge>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-[#00C8F0]/10 bg-[#0A1628]/50">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { ref: c1.ref, val: c1.count, suffix: '+', label: 'Surveys Completed' },
            { ref: c2.ref, val: c2.count, suffix: '%', label: 'Customer Satisfaction' },
            { ref: c3.ref, val: c3.count, suffix: '+', label: 'Item Library' },
            { ref: c4.ref, val: c4.count, suffix: '',  label: 'Active Surveyors' },
          ].map(({ ref, val, suffix, label }) => (
            <div key={label} ref={ref}>
              <div className="syne font-black text-4xl text-[#00C8F0]">{val.toLocaleString()}{suffix}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal>
            <span className="text-[10px] text-[#00C8F0] font-bold uppercase tracking-[4px]">Platform Features</span>
            <h2 className="syne text-4xl md:text-5xl font-black mt-3 mb-4 tracking-tight">Everything You Need<br />to Run a Survey</h2>
            <p className="text-slate-400 font-light max-w-md leading-relaxed">From customer request to final report — one platform handles it all with zero friction.</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, borderColor: 'rgba(0,200,240,0.4)' }}
                  className="group relative bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 transition-colors overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00C8F0] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 bg-[#00C8F0]/10 border border-[#00C8F0]/20 rounded-2xl flex items-center justify-center text-2xl mb-6">{f.icon}</div>
                  <h3 className="syne font-bold text-lg mb-3">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-light">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE MAP ── */}
      <section id="live-map" className="py-28 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <span className="text-[10px] text-[#00C8F0] font-bold uppercase tracking-[4px]">Live GPS Demo</span>
              <h2 className="syne text-4xl md:text-5xl font-black mt-3 mb-4 tracking-tight">Watch Your Surveyor<br />Move in Real-Time</h2>
              <p className="text-slate-400 font-light leading-relaxed mb-8">Customers get a unique link. No app install needed. The map updates every few seconds as the surveyor travels to their property.</p>

              <div className="space-y-4">
                {[
                  { icon: '📍', color: 'bg-green-500/10 border-green-500/30', title: 'Live Surveyor Location', desc: 'GPS updates via browser or GPSLogger app. Realtime Supabase subscriptions.' },
                  { icon: '🏠', color: 'bg-[#00C8F0]/10 border-[#00C8F0]/20', title: 'Customer Property Pin', desc: 'Destination pinned so customers can estimate arrival time at a glance.' },
                  { icon: '📊', color: 'bg-orange-500/10 border-orange-500/30', title: 'Route & Status Banner', desc: '"En Route", "Arrived", "Completed" — auto-updates with each status change.' },
                ].map(item => (
                  <motion.div key={item.title}
                    whileHover={{ x: 6 }}
                    className={`flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-[#00C8F0]/30 transition-colors`}
                  >
                    <div className={`w-10 h-10 ${item.color} border rounded-xl flex items-center justify-center text-lg shrink-0`}>{item.icon}</div>
                    <div>
                      <div className="syne font-bold text-sm mb-1">{item.title}</div>
                      <div className="text-xs text-slate-400 font-light leading-relaxed">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-[#00C8F0]/5 border border-[#00C8F0]/20 rounded-2xl">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Demo Map Shows</div>
                <div className="syne font-bold">Kuwait City, Kuwait 🇰🇼</div>
                <div className="text-xs text-slate-400 mt-1 font-light">OpenStreetMap — 100% free, no API key required</div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="rounded-3xl overflow-hidden border border-[#00C8F0]/20 shadow-2xl" style={{ height: 480 }}>
                <MapContainer center={[29.376, 47.976]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                  />
                  <MovingMarker from={SURVEYOR_START} to={CUSTOMER_POS} />
                  <Marker position={CUSTOMER_POS} icon={homeIcon}>
                    <Popup><b>Survey Destination</b><br />Salmiya, Block 5<br /><small>Confirmed: 10:00 AM</small></Popup>
                  </Marker>
                  <Polyline positions={[SURVEYOR_START, CUSTOMER_POS]}
                    color="#00C8F0" weight={2} dashArray="10 6" opacity={0.5} />
                </MapContainer>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal className="text-center mb-20">
            <span className="text-[10px] text-[#00C8F0] font-bold uppercase tracking-[4px]">Process</span>
            <h2 className="syne text-4xl md:text-5xl font-black mt-3 tracking-tight">From Request to Report<br />in 4 Simple Steps</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* connector line */}
            <div className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#00C8F0]/30 to-transparent" />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="w-16 h-16 border-2 border-[#00C8F0]/40 rounded-full flex items-center justify-center syne font-black text-2xl text-[#00C8F0] mx-auto mb-5 bg-[#0A1628] relative z-10 transition-all hover:bg-[#00C8F0] hover:text-[#060E1E] hover:border-[#00C8F0]"
                >
                  {s.n}
                </motion.div>
                <h3 className="syne font-bold text-base mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm font-light leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTAINER ENGINE ── */}
      <section className="py-28 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal className="text-center mb-16">
            <span className="text-[10px] text-[#00C8F0] font-bold uppercase tracking-[4px]">Container Engine</span>
            <h2 className="syne text-4xl md:text-5xl font-black mt-3 tracking-tight">Smart Container<br />Recommendations</h2>
            <p className="text-slate-400 font-light mt-3">Click a container to see how your CBM fits.</p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CONTAINERS.map((c, i) => (
              <Reveal key={c.type} delay={i * 0.06}>
                <motion.div
                  onClick={() => setSelectedContainer(i)}
                  whileHover={{ y: -6 }}
                  className={`cursor-pointer rounded-2xl p-5 text-center border transition-all ${
                    selectedContainer === i
                      ? 'border-[#00C8F0]/60 bg-[#00C8F0]/10'
                      : 'border-white/[0.07] bg-white/[0.03] hover:border-[#00C8F0]/30'
                  }`}
                >
                  {c.best && <div className="text-[9px] bg-[#00C8F0]/20 text-[#00C8F0] rounded-full px-2 py-0.5 mb-2 font-bold uppercase tracking-wider">Popular</div>}
                  <div className="text-3xl mb-3">{i < 2 ? '📦' : i < 4 ? '🚢' : '🛳️'}</div>
                  <div className="syne font-bold text-xs mb-1">{c.type}</div>
                  <div className="syne font-black text-lg" style={{ color: c.color }}>{c.cbm}</div>
                  <div className="text-[10px] text-slate-500 mb-3">CBM max</div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: c.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.fill}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 + i * 0.1 }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{c.fill}% filled</div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-br from-[#060E1E] via-[#0A1628] to-[#0D2B4E]">
        <div className="absolute inset-0 bg-radial-[ellipse_50%_70%_at_50%_50%] from-[#00C8F0]/6 via-transparent to-transparent" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <Reveal>
            <h2 className="syne text-5xl md:text-6xl font-black tracking-tight mb-5 leading-tight">
              Ready to Transform<br />
              <span className="text-[#00C8F0]">Your Survey Ops?</span>
            </h2>
            <p className="text-slate-400 text-lg font-light mb-10">Request your first survey in under 2 minutes. No account needed.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/survey"
                className="bg-[#00C8F0] hover:bg-white text-[#060E1E] syne font-bold px-10 py-4 rounded-2xl text-base transition-all hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(0,200,240,0.35)]">
                Request Free Survey Now
              </Link>
              <a href="#features"
                className="border border-white/20 hover:border-[#00C8F0] text-white hover:text-[#00C8F0] syne font-semibold px-8 py-4 rounded-2xl text-base transition-all">
                Explore Features
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#060E1E] border-t border-white/[0.06] py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#00C8F0] text-[#060E1E] syne font-black text-sm px-2.5 py-1 rounded-lg">Q</div>
              <span className="syne font-bold text-lg">Q'go <span className="text-[#00C8F0]">Cargo</span></span>
            </div>
            <p className="text-slate-500 text-sm font-light leading-relaxed">Kuwait's logistics survey management platform. Built for modern relocation companies.</p>
          </div>
          {[
            { title: 'Platform', links: ['Features','How It Works','Live Tracking','Request Survey'] },
            { title: 'Portals',  links: ['Admin Portal','Surveyor App','Customer Portal','Operations'] },
            { title: 'Tech',     links: ['React + Vite','Supabase','OpenStreetMap','Tailwind CSS'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="syne font-bold text-xs uppercase tracking-[3px] text-slate-400 mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-[#00C8F0] transition-colors font-light">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
          <span>© 2026 Q'go Cargo. All rights reserved.</span>
          <span>Kuwait City, Kuwait 🇰🇼</span>
        </div>
      </footer>
    </div>
  )
}
