import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Building2, DollarSign, Workflow, Bell, Palette, Globe, Map, Package, Scale, Wrench, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import CompanyTab from '@/components/settings/tabs/CompanyTab'
import PricingTab from '@/components/settings/tabs/PricingTab'
import WorkflowTab from '@/components/settings/tabs/WorkflowTab'
import NotificationsTab from '@/components/settings/tabs/NotificationsTab'
import BrandingTab from '@/components/settings/tabs/BrandingTab'
import LandingPageTab from '@/components/settings/tabs/LandingPageTab'
import ZonesTab from '@/components/settings/tabs/ZonesTab'
import CategoriesTab from '@/components/settings/tabs/CategoriesTab'
import LegalTab from '@/components/settings/tabs/LegalTab'
import CustomFieldsTab from '@/components/settings/tabs/CustomFieldsTab'
import PDFTab from '@/components/settings/tabs/PDFTab'

const TABS = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'workflow', label: 'Workflow', icon: Workflow },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'pdf', label: 'PDF/Invoices', icon: FileText },
  { id: 'landing', label: 'Landing Page', icon: Globe },
  { id: 'zones', label: 'Zones', icon: Map },
  { id: 'categories', label: 'Categories', icon: Package },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'custom-fields', label: 'Custom Fields', icon: Wrench },
]

const tabComponents = {
  company: CompanyTab,
  pricing: PricingTab,
  workflow: WorkflowTab,
  notifications: NotificationsTab,
  branding: BrandingTab,
  pdf: PDFTab,
  landing: LandingPageTab,
  zones: ZonesTab,
  categories: CategoriesTab,
  legal: LegalTab,
  'custom-fields': CustomFieldsTab,
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('company')
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('app_settings').select('key, value')
    const map = Object.fromEntries((data || []).map(s => [s.key, s.value ?? '']))
    setSettings(map)
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    try {
      // Use upsert to handle both insert and update
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: getCategoryForKey(key)
      }))

      const { error } = await supabase
        .from('app_settings')
        .upsert(settingsArray, { onConflict: 'key' })

      if (error) throw error
      toast.success('Settings saved!')
      load() // Reload to sync
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save settings: ' + err.message)
    }
    setSaving(false)
  }

  function getCategoryForKey(key) {
    if (key.startsWith('company_') || key === 'currency') return 'general'
    if (key.startsWith('smtp_') || key.startsWith('notify_')) return 'email'
    if (key.startsWith('color_') || key.includes('logo') || key.includes('favicon')) return 'branding'
    if (key.startsWith('landing_')) return 'landing'
    if (key.startsWith('pdf_') || key.includes('quote_validity') || key.includes('payment_terms')) return 'pdf'
    if (key.includes('cbm') || key.includes('rate') || key.includes('tax') || key.includes('charge') || key.includes('insurance')) return 'pricing'
    if (key.includes('survey') || key.includes('assign') || key.includes('deadline') || key.includes('reminder')) return 'workflow'
    if (key.includes('terms') || key.includes('privacy') || key.includes('refund')) return 'legal'
    return 'general'
  }

  function updateSetting(key, value) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  function saveTab() {
    save()
  }

  const ActiveTabComponent = tabComponents[activeTab]

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-qgo-blue border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-qgo-text">Settings</h1>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {/* Horizontal Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex -mb-px space-x-1 min-w-max">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-qgo-blue text-qgo-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ActiveTabComponent
          settings={settings}
          updateSetting={updateSetting}
          onSave={saveTab}
          saving={saving}
        />
      </div>
    </div>
  )
}
