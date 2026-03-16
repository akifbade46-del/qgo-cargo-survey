import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import QgoLogo from '@/components/common/QgoLogo'
import toast from 'react-hot-toast'
import { CheckCircle, MapPin, Home, Calendar, Phone, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react'
import LocationPicker from '@/components/common/LocationPicker'

const STEPS = ['Contact', 'From', 'To', 'Property', 'Schedule']
const slide = {
  initial: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit:    (d) => ({ x: d < 0 ? 60 : -60, opacity: 0 }),
}

export default function SurveyWizard() {
  const [step, setStep]       = useState(0)
  const [dir, setDir]         = useState(1)
  const [done, setDone]       = useState(false)
  const [refNo, setRefNo]     = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm]       = useState({
    customer_name: '', customer_email: '', customer_phone: '', whatsapp_number: '',
    from_address: '', from_city: '', from_country: 'Kuwait',
    from_lat: null, from_lng: null,
    to_address: '', to_city: '', to_country: '',
    to_lat: null, to_lng: null,
    property_type: 'apartment', floor: '', has_elevator: false, bedrooms: '2',
    preferred_date: '', preferred_time_slot: 'morning',
    move_type: 'international', notes: ''
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const go  = (n) => { setDir(n > step ? 1 : -1); setStep(n) }

  async function submit() {
    if (!form.customer_name || !form.customer_email || !form.from_address) {
      return toast.error('Please fill required fields')
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.from('survey_requests').insert([form]).select('reference_number').single()
      if (error) throw error
      setRefNo(data.reference_number)
      setDone(true)
    } catch (e) {
      toast.error(e.message)
    } finally { setLoading(false) }
  }

  if (done) return <SuccessScreen refNo={refNo} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-qgo-navy via-qgo-blue to-cyan-500 flex flex-col">
      <div className="p-6 flex justify-between items-center">
        <Link to="/" className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors">
            ← Home
          </Link>
          <QgoLogo white />
        <span className="text-white/70 text-sm font-medium">Step {step + 1} / {STEPS.length}</span>
      </div>
      <div className="px-6 mb-6">
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-white' : 'bg-white/20'}`} />
              <p className={`text-xs mt-1 text-center hidden sm:block ${i <= step ? 'text-white' : 'text-white/40'}`}>{s}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 px-4 pb-8 flex items-start justify-center">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={slide}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}>
              {step === 0 && <Step1 form={form} set={set} />}
              {step === 1 && <Step2 form={form} set={set} />}
              {step === 2 && <Step3 form={form} set={set} />}
              {step === 3 && <Step4 form={form} set={set} />}
              {step === 4 && <Step5 form={form} set={set} />}
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button className="btn-secondary flex items-center gap-1" onClick={() => go(step - 1)}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <div className="flex-1" />
            {step < STEPS.length - 1 ? (
              <button className="btn-primary flex items-center gap-1" onClick={() => go(step + 1)}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn-primary flex items-center gap-2" onClick={submit} disabled={loading}>
                {loading ? 'Submitting...' : <><CheckCircle size={16} /> Submit Request</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const F = ({ label, children }) => (
  <div><label className="label">{label}</label>{children}</div>
)

function Step1({ form, set }) {
  return (
    <div className="space-y-4">
      <StepHeader icon={<Phone size={20} className="text-qgo-blue" />} title="Contact Details" sub="Tell us who you are" />
      <F label="Full Name *"><input className="input" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="Ahmed Al-Rashid" /></F>
      <F label="Email Address *"><input className="input" type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)} placeholder="ahmed@email.com" /></F>
      <div className="grid grid-cols-2 gap-3">
        <F label="Phone"><input className="input" value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} placeholder="+965 XXXX XXXX" /></F>
        <F label="WhatsApp"><input className="input" value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} placeholder="+965 XXXX XXXX" /></F>
      </div>
    </div>
  )
}

function Step2({ form, set }) {
  return (
    <div className="space-y-4">
      <StepHeader icon={<MapPin size={20} className="text-qgo-blue" />} title="Moving From" sub="Your current address" />
      <F label="Full Address *"><textarea className="input resize-none" rows={2} value={form.from_address} onChange={e => set('from_address', e.target.value)} placeholder="Block 5, Street 12, House 8..." /></F>
      <div className="grid grid-cols-2 gap-3">
        <F label="City"><input className="input" value={form.from_city} onChange={e => set('from_city', e.target.value)} placeholder="Kuwait City" /></F>
        <F label="Country"><input className="input" value={form.from_country} onChange={e => set('from_country', e.target.value)} placeholder="Kuwait" /></F>
      </div>

      {/* Location Picker */}
      <LocationPicker
        value={form.from_lat && form.from_lng ? { lat: form.from_lat, lng: form.from_lng } : null}
        onChange={(loc) => { set('from_lat', loc.lat); set('from_lng', loc.lng) }}
        label="Pin Your Pickup Location"
        placeholder="Surveyor will visit this location"
        mapId="from-location"
      />

      <F label="Move Type">
        <select className="input" value={form.move_type} onChange={e => set('move_type', e.target.value)}>
          <option value="local">Local (within city)</option>
          <option value="domestic">Domestic (within country)</option>
          <option value="international">International</option>
        </select>
      </F>
    </div>
  )
}

function Step3({ form, set }) {
  return (
    <div className="space-y-4">
      <StepHeader icon={<MapPin size={20} className="text-green-600" />} title="Moving To" sub="Your destination address" />
      <F label="Full Address"><textarea className="input resize-none" rows={2} value={form.to_address} onChange={e => set('to_address', e.target.value)} placeholder="123 Main Street, Dubai..." /></F>
      <div className="grid grid-cols-2 gap-3">
        <F label="City"><input className="input" value={form.to_city} onChange={e => set('to_city', e.target.value)} placeholder="Dubai" /></F>
        <F label="Country *"><input className="input" value={form.to_country} onChange={e => set('to_country', e.target.value)} placeholder="UAE" /></F>
      </div>

      {/* Location Picker */}
      <LocationPicker
        value={form.to_lat && form.to_lng ? { lat: form.to_lat, lng: form.to_lng } : null}
        onChange={(loc) => { set('to_lat', loc.lat); set('to_lng', loc.lng) }}
        label="Pin Destination Location"
        placeholder="Your destination address"
        mapId="to-location"
      />
    </div>
  )
}

function Step4({ form, set }) {
  return (
    <div className="space-y-4">
      <StepHeader icon={<Home size={20} className="text-qgo-blue" />} title="Property Details" sub="Tell us about your home" />
      <div className="grid grid-cols-2 gap-3">
        <F label="Property Type">
          <select className="input" value={form.property_type} onChange={e => set('property_type', e.target.value)}>
            {['apartment','villa','office','studio','warehouse'].map(v => <option key={v} className="capitalize">{v}</option>)}
          </select>
        </F>
        <F label="Bedrooms">
          <select className="input" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
            {['Studio','1','2','3','4','5','6+'].map(v => <option key={v}>{v}</option>)}
          </select>
        </F>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <F label="Floor"><input className="input" value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="e.g. 3rd" /></F>
        <F label="Elevator?">
          <select className="input" value={String(form.has_elevator)} onChange={e => set('has_elevator', e.target.value === 'true')}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </F>
      </div>
      <F label="Special Requirements">
        <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Piano, antique items, fragile artwork..." />
      </F>
    </div>
  )
}

function Step5({ form, set }) {
  return (
    <div className="space-y-4">
      <StepHeader icon={<Calendar size={20} className="text-qgo-blue" />} title="Preferred Schedule" sub="When should we visit?" />
      <F label="Preferred Survey Date">
        <input className="input" type="date" value={form.preferred_date}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => set('preferred_date', e.target.value)} />
      </F>
      <F label="Preferred Time">
        <div className="grid grid-cols-3 gap-2">
          {['morning','afternoon','evening'].map(t => (
            <button key={t} type="button" onClick={() => set('preferred_time_slot', t)}
              className={`py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors ${
                form.preferred_time_slot === t
                  ? 'bg-qgo-blue text-white border-qgo-blue'
                  : 'border-gray-200 text-gray-600 hover:border-qgo-blue'
              }`}>{t}</button>
          ))}
        </div>
      </F>
      <div className="bg-qgo-bg rounded-xl p-4 text-sm space-y-1.5 mt-2">
        <p className="font-semibold text-qgo-text mb-2">📋 Summary</p>
        <p className="text-gray-600"><span className="font-medium">Name:</span> {form.customer_name || '—'}</p>
        <p className="text-gray-600"><span className="font-medium">From:</span> {form.from_city || '—'}, {form.from_country}</p>
        {form.from_lat && form.from_lng && (
          <p className="text-green-600 text-xs flex items-center gap-1">
            ✓ Location pinned
          </p>
        )}
        <p className="text-gray-600"><span className="font-medium">To:</span> {form.to_city || '—'}, {form.to_country || '—'}</p>
        {form.to_lat && form.to_lng && (
          <p className="text-green-600 text-xs flex items-center gap-1">
            ✓ Location pinned
          </p>
        )}
        <p className="text-gray-600"><span className="font-medium">Property:</span> {form.bedrooms} BR {form.property_type}</p>
      </div>
    </div>
  )
}

function StepHeader({ icon, title, sub }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-qgo-bg rounded-xl flex items-center justify-center">{icon}</div>
      <div><h2 className="text-xl font-bold text-qgo-text">{title}</h2><p className="text-sm text-gray-500">{sub}</p></div>
    </div>
  )
}

function SuccessScreen({ refNo }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-qgo-navy via-qgo-blue to-cyan-500 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </motion.div>
        <QgoLogo size="md" />
        <h2 className="text-2xl font-bold text-qgo-text mt-4 mb-2">Request Submitted!</h2>
        <p className="text-gray-500 text-sm mb-6">Our team will contact you within 24 hours to confirm your survey appointment.</p>
        <div className="bg-qgo-bg rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 mb-1">Your Reference Number</p>
          <p className="text-2xl font-bold text-qgo-blue tracking-wider">{refNo}</p>
        </div>
        {/* Track Your Survey Button */}
        <Link
          to={`/portal/${refNo}`}
          className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
        >
          <ExternalLink size={18} />
          View Your Portal
        </Link>
        <Link
          to={`/track/${refNo}`}
          className="w-full flex items-center justify-center gap-2 mb-3 text-qgo-blue hover:underline text-sm"
        >
          Track Your Survey →
        </Link>
        <p className="text-xs text-gray-400 mb-4">
          Save this reference number to access your portal and track status anytime
        </p>
        <a href="/" className="btn-secondary inline-block">Submit Another Request</a>
      </motion.div>
    </div>
  )
}
