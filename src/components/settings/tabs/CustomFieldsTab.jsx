import { Wrench, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
]

export default function CustomFieldsTab({ settings, updateSetting }) {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [newField, setNewField] = useState({
    field_name: '',
    field_type: 'text',
    options: '',
    is_required: false,
  })

  useEffect(() => { loadFields() }, [])

  async function loadFields() {
    const { data } = await supabase.from('custom_fields').select('*').order('sort_order')
    setFields(data || [])
    setLoading(false)
  }

  async function addField() {
    if (!newField.field_name) {
      toast.error('Field name is required')
      return
    }

    const maxOrder = Math.max(...fields.map(f => f.sort_order || 0), -1)
    const { error } = await supabase.from('custom_fields').insert([{
      field_name: newField.field_name,
      field_type: newField.field_type,
      options: newField.field_type === 'dropdown' ? newField.options.split(',').map(o => o.trim()).filter(Boolean) : null,
      is_required: newField.is_required,
      sort_order: maxOrder + 1,
    }])

    if (error) toast.error(error.message)
    else {
      toast.success('Field added!')
      setNewField({ field_name: '', field_type: 'text', options: '', is_required: false })
      loadFields()
    }
  }

  async function toggleField(id, isActive) {
    const { error } = await supabase.from('custom_fields').update({ is_active: !isActive }).eq('id', id)
    if (!error) loadFields()
  }

  async function deleteField(id) {
    const { error } = await supabase.from('custom_fields').delete().eq('id', id)
    if (!error) {
      toast.success('Field deleted')
      loadFields()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
        <Wrench className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-qgo-text">Custom Survey Fields</h2>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <p className="text-sm text-indigo-800">
          Add custom fields to your survey form to collect additional information from customers.
          These fields will appear on the survey wizard.
        </p>
      </div>

      {/* Add New Field */}
      <div className="border border-dashed border-gray-300 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Add New Field</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="input text-sm"
            placeholder="Field name"
            value={newField.field_name}
            onChange={e => setNewField({ ...newField, field_name: e.target.value })}
          />
          <select
            className="input text-sm"
            value={newField.field_type}
            onChange={e => setNewField({ ...newField, field_type: e.target.value })}
          >
            {FIELD_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {newField.field_type === 'dropdown' && (
            <input
              className="input text-sm"
              placeholder="Options (comma separated)"
              value={newField.options}
              onChange={e => setNewField({ ...newField, options: e.target.value })}
            />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newField.is_required}
              onChange={e => setNewField({ ...newField, is_required: e.target.checked })}
              className="rounded"
            />
            Required
          </label>
        </div>
        <button onClick={addField} className="btn-primary mt-3 flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Field
        </button>
      </div>

      {/* Fields List */}
      <div className="space-y-2">
        {fields.map(field => (
          <div key={field.id} className={`flex items-center justify-between p-4 rounded-lg border ${field.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-2 py-1 rounded ${
                field.field_type === 'text' ? 'bg-gray-100 text-gray-700' :
                field.field_type === 'textarea' ? 'bg-blue-100 text-blue-700' :
                field.field_type === 'number' ? 'bg-green-100 text-green-700' :
                field.field_type === 'date' ? 'bg-purple-100 text-purple-700' :
                field.field_type === 'dropdown' ? 'bg-orange-100 text-orange-700' :
                'bg-pink-100 text-pink-700'
              }`}>
                {FIELD_TYPES.find(t => t.value === field.field_type)?.label || field.field_type}
              </span>
              <div>
                <p className="font-medium">{field.field_name}</p>
                {field.options && field.options.length > 0 && (
                  <p className="text-xs text-gray-500">Options: {field.options.join(', ')}</p>
                )}
              </div>
              {field.is_required && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Required</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleField(field.id, field.is_active)}
                className={`text-xs px-2 py-1 rounded ${field.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
              >
                {field.is_active ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => deleteField(field.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No custom fields yet. Add your first field above!
          </div>
        )}
      </div>
    </div>
  )
}
