import { useState } from 'react'
import { INVENTORY_TEMPLATES, getAllTemplates } from '@/utils/inventoryTemplates'
import { Home, Building, Warehouse, Check } from 'lucide-react'

/**
 * Inventory Template Selector Component
 * Allows quick addition of pre-built room templates
 */
export default function TemplateSelector({ onTemplateSelect, onClose }) {
  const [selected, setSelected] = useState(null)

  const templates = getAllTemplates()

  const handleSelect = (template) => {
    setSelected(template.id)
    onTemplateSelect?.(template)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-qgo-text flex items-center gap-2">
          <Home size={18} className="text-qgo-blue" />
          Quick Start Templates
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            ✕
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Select a template to quickly add common items. You can edit quantities later.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => {
          const Icon = getTemplateIcon(template.id)
          return (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                selected === template.id
                  ? 'border-qgo-blue bg-blue-50'
                  : 'border-gray-200 hover:border-qgo-blue'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-qgo-text">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.nameAr}</p>
                  </div>
                </div>
                {selected === template.id && (
                  <div className="w-5 h-5 bg-qgo-blue rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>📦 {template.rooms.length} rooms</p>
                <p>📊 ~{template.estimatedCBM} CBM</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
        💡 <strong>Tip:</strong> Templates are starting points. Add, remove, or edit items to match the actual property.
      </div>
    </div>
  )
}

function getTemplateIcon(id) {
  const icons = {
    studio_apartment: Home,
    one_bhk: Home,
    two_bhk: Home,
    three_bhk: Home,
    villa: Home,
    office: Building,
    warehouse: Warehouse
  }
  return icons[id] || Home
}

/**
 * Template Badge - Shows which template was used
 */
export function TemplateBadge({ templateId, onReset }) {
  const template = Object.values(INVENTORY_TEMPLATES).find(t => t.id === templateId)

  if (!template) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-qgo-bg rounded-full text-sm">
      <span>{template.icon}</span>
      <span className="text-gray-600">Using <strong>{template.name}</strong> template</span>
      {onReset && (
        <button
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-red-500 ml-1"
        >
          ✕
        </button>
      )}
    </div>
  )
}
