import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { DollarSign, Save, Plus, Trash2, Edit2 } from 'lucide-react'
import { formatCurrency } from '@/utils/pricing'

const CONTAINER_TYPES = ['lcl', 'groupage', '20ft', '20ft_hc', '40ft', '40ft_hc']
const ROUTE_TYPES = ['local', 'domestic', 'international']
const CONTAINERS = {
  lcl: { label: 'LCL (Less than Container)' },
  groupage: { label: 'Groupage (Shared Container)' },
  '20ft': { label: '20ft Standard' },
  '20ft_hc': { label: '20ft High Cube' },
  '40ft': { label: '40ft Standard' },
  '40ft_hc': { label: '40ft High Cube' }
}

export default function PricingManagement() {
  const [pricing, setPricing] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    container_type: '20ft',
    route_type: 'international',
    origin_country: 'Kuwait',
    destination_country: '',
    base_price: '',
    price_per_cbm: '',
    min_charge: ''
  })

  useEffect(() => {
    loadPricing()
    loadServices()
  }, [])

  async function loadPricing() {
    setLoading(true)
    const { data, error } = await supabase
      .from('pricing')
      .select('*')
      .eq('is_active', true)
      .order('container_type', { ascending: true })

    if (!error) setPricing(data || [])
    setLoading(false)
  }

  async function loadServices() {
    const { data, error } = await supabase
      .from('additional_services_pricing')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (!error) setServices(data || [])
  }

  async function savePricing() {
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase
          .from('pricing')
          .update({
            base_price: parseFloat(formData.base_price),
            price_per_cbm: formData.price_per_cbm ? parseFloat(formData.price_per_cbm) : null,
            min_charge: formData.min_charge ? parseFloat(formData.min_charge) : null
          })
          .eq('id', editing)

        if (error) throw error
        toast.success('Pricing updated!')
      } else {
        const { error } = await supabase
          .from('pricing')
          .insert([{
            container_type: formData.container_type,
            route_type: formData.route_type,
            origin_country: formData.origin_country || null,
            destination_country: formData.destination_country || null,
            base_price: parseFloat(formData.base_price),
            price_per_cbm: formData.price_per_cbm ? parseFloat(formData.price_per_cbm) : null,
            min_charge: formData.min_charge ? parseFloat(formData.min_charge) : null
          }])

        if (error) throw error
        toast.success('Pricing added!')
      }

      setEditing(null)
      resetForm()
      loadPricing()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deletePricing(id) {
    if (!confirm('Are you sure you want to delete this pricing?')) return

    const { error } = await supabase
      .from('pricing')
      .update({ is_active: false })
      .eq('id', id)

    if (!error) {
      toast.success('Pricing deleted')
      loadPricing()
    }
  }

  function editPricing(item) {
    setEditing(item.id)
    setFormData({
      container_type: item.container_type,
      route_type: item.route_type,
      origin_country: item.origin_country || '',
      destination_country: item.destination_country || '',
      base_price: item.base_price,
      price_per_cbm: item.price_per_cbm || '',
      min_charge: item.min_charge || ''
    })
  }

  function resetForm() {
    setFormData({
      container_type: '20ft',
      route_type: 'international',
      origin_country: 'Kuwait',
      destination_country: '',
      base_price: '',
      price_per_cbm: '',
      min_charge: ''
    })
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-qgo-text flex items-center gap-2">
          <DollarSign className="text-green-600" />
          Pricing Management
        </h1>
      </div>

      {/* Add/Edit Pricing Form */}
      <div className="card !p-6">
        <h3 className="font-bold text-lg mb-4">
          {editing ? 'Edit Pricing' : 'Add New Pricing'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="label">Container Type</label>
            <select
              className="input"
              value={formData.container_type}
              onChange={e => setFormData({ ...formData, container_type: e.target.value })}
              disabled={!!editing}
            >
              {CONTAINER_TYPES.map(type => (
                <option key={type} value={type}>{CONTAINERS[type]?.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Route Type</label>
            <select
              className="input"
              value={formData.route_type}
              onChange={e => setFormData({ ...formData, route_type: e.target.value })}
              disabled={!!editing}
            >
              {ROUTE_TYPES.map(type => (
                <option key={type} value={type} className="capitalize">{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Origin Country</label>
            <input
              className="input"
              value={formData.origin_country}
              onChange={e => setFormData({ ...formData, origin_country: e.target.value })}
              placeholder="Kuwait"
              disabled={!!editing}
            />
          </div>

          <div>
            <label className="label">Destination</label>
            <input
              className="input"
              value={formData.destination_country}
              onChange={e => setFormData({ ...formData, destination_country: e.target.value })}
              placeholder="Optional"
              disabled={!!editing}
            />
          </div>

          <div>
            <label className="label">Base Price (KWD)</label>
            <input
              type="number"
              className="input"
              value={formData.base_price}
              onChange={e => setFormData({ ...formData, base_price: e.target.value })}
              placeholder="1200"
              step="0.01"
            />
          </div>

          <div>
            <label className="label">Price per CBM (LCL)</label>
            <input
              type="number"
              className="input"
              value={formData.price_per_cbm}
              onChange={e => setFormData({ ...formData, price_per_cbm: e.target.value })}
              placeholder="25"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={savePricing}
            disabled={saving || !formData.base_price}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : editing ? 'Update Pricing' : 'Add Pricing'}
          </button>

          {editing && (
            <button
              onClick={() => {
                setEditing(null)
                resetForm()
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Pricing Table */}
      <div className="card !p-6">
        <h3 className="font-bold text-lg mb-4">Current Pricing</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-qgo-blue border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2">Container</th>
                  <th className="text-left py-3 px-2">Route</th>
                  <th className="text-left py-3 px-2">Origin → Destination</th>
                  <th className="text-right py-3 px-2">Base Price</th>
                  <th className="text-right py-3 px-2">per CBM</th>
                  <th className="text-center py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{CONTAINERS[item.container_type]?.label}</td>
                    <td className="py-3 px-2 capitalize">{item.route_type}</td>
                    <td className="py-3 px-2">
                      {item.origin_country} → {item.destination_country || 'All'}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold">
                      {formatCurrency(item.base_price)}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-600">
                      {item.price_per_cbm ? formatCurrency(item.price_per_cbm) : '—'}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => editPricing(item)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit2 size={14} className="text-qgo-blue" />
                        </button>
                        <button
                          onClick={() => deletePricing(item.id)}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Services */}
      <div className="card !p-6">
        <h3 className="font-bold text-lg mb-4">Additional Services</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map(service => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{service.service_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{service.unit}</p>
                </div>
                <button
                  onClick={() => deleteService(service.id)}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
              <p className="text-lg font-bold text-qgo-blue">
                {formatCurrency(service.price)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  async function deleteService(id) {
    if (!confirm('Delete this service?')) return

    const { error } = await supabase
      .from('additional_services_pricing')
      .update({ is_active: false })
      .eq('id', id)

    if (!error) {
      toast.success('Service deleted')
      loadServices()
    }
  }
}
