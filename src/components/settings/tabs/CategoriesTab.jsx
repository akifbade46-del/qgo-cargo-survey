import { Package, Plus, Trash2, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const EMOJIS = ['📦', '🛋️', '🛏️', '🚪', '🪑', '🖥️', '📺', '🧊', '🚿', '📚', '🎸', '🚴', '👕']

export default function CategoriesTab({ settings, updateSetting }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCat, setNewCat] = useState({ name: '', icon: '📦', description: '' })

  useEffect(() => { loadCategories() }, [])

  async function loadCategories() {
    const { data } = await supabase.from('item_categories').select('*').order('sort_order')
    setCategories(data || [])
    setLoading(false)
  }

  async function addCategory() {
    if (!newCat.name) {
      toast.error('Category name is required')
      return
    }

    const maxOrder = Math.max(...categories.map(c => c.sort_order || 0), -1)
    const { error } = await supabase.from('item_categories').insert([{
      name: newCat.name,
      icon: newCat.icon,
      description: newCat.description,
      sort_order: maxOrder + 1,
    }])

    if (error) toast.error(error.message)
    else {
      toast.success('Category added!')
      setNewCat({ name: '', icon: '📦', description: '' })
      loadCategories()
    }
  }

  async function toggleCategory(id, isActive) {
    const { error } = await supabase.from('item_categories').update({ is_active: !isActive }).eq('id', id)
    if (!error) loadCategories()
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('item_categories').delete().eq('id', id)
    if (!error) {
      toast.success('Category deleted')
      loadCategories()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Package className="w-5 h-5 text-orange-600" />
        <h2 className="text-lg font-bold text-qgo-text">Item Categories</h2>
      </div>

      {/* Add New Category */}
      <div className="border border-dashed border-gray-300 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Add New Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="input text-sm"
            placeholder="Category name"
            value={newCat.name}
            onChange={e => setNewCat({ ...newCat, name: e.target.value })}
          />
          <div className="flex gap-2">
            <select
              className="input text-sm flex-1"
              value={newCat.icon}
              onChange={e => setNewCat({ ...newCat, icon: e.target.value })}
            >
              {EMOJIS.map(emoji => (
                <option key={emoji} value={emoji}>{emoji}</option>
              ))}
            </select>
            <span className="text-2xl">{newCat.icon}</span>
          </div>
          <input
            className="input text-sm"
            placeholder="Description (optional)"
            value={newCat.description}
            onChange={e => setNewCat({ ...newCat, description: e.target.value })}
          />
          <button onClick={addCategory} className="btn-primary flex items-center justify-center gap-2 text-sm">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map(cat => (
          <div key={cat.id} className={`flex items-center gap-3 p-3 rounded-lg border ${cat.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
            <GripVertical className="text-gray-400" size={18} />
            <span className="text-2xl">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{cat.name}</p>
              {cat.description && <p className="text-xs text-gray-500 truncate">{cat.description}</p>}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => toggleCategory(cat.id, cat.is_active)}
                className={`text-xs px-2 py-1 rounded ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
              >
                {cat.is_active ? 'On' : 'Off'}
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-3 text-center text-gray-400 py-8">
            No categories yet. Add your first category above!
          </div>
        )}
      </div>
    </div>
  )
}
