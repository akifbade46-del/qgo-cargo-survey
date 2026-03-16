import { motion } from 'framer-motion'
import { Home, Package, CheckCircle } from 'lucide-react'

const tabs = [
  { id: 'rooms', label: 'Rooms', icon: Home },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'complete', label: 'Complete', icon: CheckCircle }
]

export default function SurveyTabNav({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 max-w-2xl mx-auto">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-green-600"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
