import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminItems() {
  const [items, setItems]         = useState([])
  const [cats, setCats]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [modal, setModal]         = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({ name: '', name_ar: '', category_id: '', default_length: '', default_width: '', default_height: '', default_weight_kg: '', is_fragile: false, requires_disassembly: false })

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: it }, { data: ct }] = await Promise.all([
      supabase.from('items').select('*,item_categories(name)').eq('is_active', true).order('name'),
      supabase.from('item_categories').select('*').order('sort_order')
    ])
    setItems(it ?? []); setCats(ct ?? [])
    setLoading(false)
  }

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.name_ar?.includes(search)
    const matchCat = catFilter === 'all' || i.category_id === catFilter
    return matchSearch && matchCat
  })

  async function saveItem() {
    setSaving(true)
    const payload = { ...form, default_length: +form.default_length, default_width: +form.default_width, default_height: +form.default_height, default_weight_kg: +form.default_weight_kg }
    const { error } = await supabase.from('items').insert([payload])
    if (error) toast.error(error.message)
    else { toast.success('Item added!'); setModal(false); load() }
    setSaving(false)
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const cbm = form.default_length && form.default_width && form.default_height
    ? ((+form.default_length * +form.default_width * +form.default_height) / 1e6).toFixed(4)
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-qgo-text">Item Library</h1>
          <p className="text-sm text-gray-500">{items.length} items across {cats.length} categories</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-52" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{['Item','Category','L×W×H (cm)','CBM','Weight','Flags'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.name_ar}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs bg-qgo-bg text-qgo-blue px-2 py-0.5 rounded">{item.item_categories?.name}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.default_length}×{item.default_width}×{item.default_height}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-qgo-blue">{item.default_cbm}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.default_weight_kg} kg</td>
                  <td className="px-4 py-3 flex gap-1 flex-wrap">
                    {item.is_fragile && <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">Fragile</span>}
                    {item.requires_disassembly && <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">Disassemble</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Add Item</h3>
              <button onClick={() => setModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Name (EN) *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="King Bed" /></div>
                <div><label className="label">Name (AR)</label><input className="input" value={form.name_ar} onChange={e => set('name_ar', e.target.value)} placeholder="سرير كينج" dir="rtl" /></div>
              </div>
              <div>
                <label className="label">Category *</label>
                <select className="input" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                  <option value="">Select category</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Length (cm)</label><input className="input" type="number" value={form.default_length} onChange={e => set('default_length', e.target.value)} /></div>
                <div><label className="label">Width (cm)</label><input className="input" type="number" value={form.default_width} onChange={e => set('default_width', e.target.value)} /></div>
                <div><label className="label">Height (cm)</label><input className="input" type="number" value={form.default_height} onChange={e => set('default_height', e.target.value)} /></div>
              </div>
              {cbm && <div className="bg-qgo-bg rounded-lg p-3 text-sm"><span className="font-medium text-qgo-blue">Auto CBM: {cbm}</span></div>}
              <div><label className="label">Weight (kg)</label><input className="input" type="number" value={form.default_weight_kg} onChange={e => set('default_weight_kg', e.target.value)} /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_fragile} onChange={e => set('is_fragile', e.target.checked)} className="rounded" /> Fragile
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.requires_disassembly} onChange={e => set('requires_disassembly', e.target.checked)} className="rounded" /> Requires Disassembly
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
                <button className="btn-primary flex-1" onClick={saveItem} disabled={saving || !form.name || !form.category_id}>
                  {saving ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
