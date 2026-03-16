import { Map, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ZonesTab({ settings, updateSetting }) {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [newZone, setNewZone] = useState({
    name: '',
    countries: '',
    base_rate: '',
    rate_per_cbm: ''
  })

  useEffect(() => { loadZones() }, [])

  async function loadZones() {
    const { data } = await supabase.from('zones').select('*').order('sort_order')
    setZones(data || [])
    setLoading(false)
  }

  async function addZone() {
    if (!newZone.name || !newZone.base_rate || !newZone.rate_per_cbm) {
      toast.error('Please fill all required fields')
      return
    }

    const { error } = await supabase.from('zones').insert([{
      name: newZone.name,
      countries: newZone.countries.split(',').map(c => c.trim()).filter(Boolean),
      base_rate: parseFloat(newZone.base_rate),
      rate_per_cbm: parseFloat(newZone.rate_per_cbm),
    }])

    if (error) toast.error(error.message)
    else {
      toast.success('Zone added!')
      setNewZone({ name: '', countries: '', base_rate: '', rate_per_cbm: '' })
      loadZones()
    }
  }

  async function toggleZone(id, isActive) {
    const { error } = await supabase.from('zones').update({ is_active: !isActive }).eq('id', id)
    if (!error) loadZones()
  }

  async function deleteZone(id) {
    const { error } = await supabase.from('zones').delete().eq('id', id)
    if (!error) {
      toast.success('Zone deleted')
      loadZones()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Map className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-bold text-qgo-text">Shipping Zones</h2>
      </div>

      {/* Add New Zone */}
      <div className="border border-dashed border-gray-300 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Add New Zone</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="input text-sm"
            placeholder="Zone name"
            value={newZone.name}
            onChange={e => setNewZone({ ...newZone, name: e.target.value })}
          />
          <input
            className="input text-sm"
            placeholder="Countries (comma separated)"
            value={newZone.countries}
            onChange={e => setNewZone({ ...newZone, countries: e.target.value })}
          />
          <input
            className="input text-sm"
            type="number"
            step="0.01"
            placeholder="Base rate"
            value={newZone.base_rate}
            onChange={e => setNewZone({ ...newZone, base_rate: e.target.value })}
          />
          <input
            className="input text-sm"
            type="number"
            step="0.01"
            placeholder="Rate per CBM"
            value={newZone.rate_per_cbm}
            onChange={e => setNewZone({ ...newZone, rate_per_cbm: e.target.value })}
          />
        </div>
        <button onClick={addZone} className="btn-primary mt-3 flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Zone
        </button>
      </div>

      {/* Zones List */}
      <div className="space-y-2">
        {zones.map(zone => (
          <div key={zone.id} className={`flex items-center justify-between p-4 rounded-lg border ${zone.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold">{zone.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${zone.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {zone.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-500">{zone.countries.join(', ')}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500">Base Rate</p>
                <p className="font-semibold">${zone.base_rate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Per CBM</p>
                <p className="font-semibold">${zone.rate_per_cbm}</p>
              </div>
              <button
                onClick={() => toggleZone(zone.id, zone.is_active)}
                className="text-sm text-qgo-blue hover:underline"
              >
                {zone.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => deleteZone(zone.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {zones.length === 0 && (
          <p className="text-center text-gray-400 py-8">No zones configured yet. Add your first zone above!</p>
        )}
      </div>
    </div>
  )
}
