import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, AlertTriangle, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ManualItemModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    cbm: '',
    weight_kg: '',
    quantity: 1,
    is_fragile: false,
    notes: ''
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Item name is required')
      return
    }

    const cbm = parseFloat(formData.cbm) || 0
    if (cbm <= 0) {
      toast.error('Please enter valid CBM')
      return
    }

    setSaving(true)
    try {
      await onSave({
        custom_name: formData.name.trim(),
        cbm: cbm,
        weight_kg: parseFloat(formData.weight_kg) || 0,
        quantity: parseInt(formData.quantity) || 1,
        is_fragile: formData.is_fragile,
        notes: formData.notes.trim()
      })
      toast.success('Custom item added!')
      // Reset form
      setFormData({
        name: '',
        cbm: '',
        weight_kg: '',
        quantity: 1,
        is_fragile: false,
        notes: ''
      })
      onClose()
    } catch (err) {
      toast.error('Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-primary)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Add Custom Item
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={20} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </div>

          {/* Form */}
          <div className="p-4 space-y-4">
            {/* Item Name */}
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Item Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Brown Leather Sofa"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full p-3 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* CBM & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                  CBM *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cbm}
                  onChange={e => handleChange('cbm', e.target.value)}
                  className="w-full p-3 rounded-xl text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.weight_kg}
                  onChange={e => handleChange('weight_kg', e.target.value)}
                  className="w-full p-3 rounded-xl text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleChange('quantity', Math.max(1, formData.quantity - 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  -
                </button>
                <span className="flex-1 text-center text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formData.quantity}
                </span>
                <button
                  onClick={() => handleChange('quantity', formData.quantity + 1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Fragile Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Fragile Item</span>
              </div>
              <button
                onClick={() => handleChange('is_fragile', !formData.is_fragile)}
                className={`w-12 h-7 rounded-full transition-colors relative ${formData.is_fragile ? 'bg-red-500' : 'bg-gray-300'}`}
              >
                <motion.div
                  animate={{ x: formData.is_fragile ? 22 : 2 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
                />
              </button>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Notes (Optional)
              </label>
              <textarea
                placeholder="Any additional details..."
                rows={2}
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                className="w-full p-3 rounded-xl text-sm resize-none"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !formData.name.trim() || !formData.cbm}
              className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {saving ? (
                'Adding...'
              ) : (
                <>
                  <Package size={18} /> Add Item
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
