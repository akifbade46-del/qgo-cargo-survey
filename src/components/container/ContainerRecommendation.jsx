import { motion } from 'framer-motion'
import { CONTAINERS, recommendContainer, getFillPercent, formatCBM } from '@/utils/cbm'
import { Package, CheckCircle } from 'lucide-react'

export default function ContainerRecommendation({ totalCBM, selectedContainer: manualSelection }) {
  if (!totalCBM || totalCBM <= 0) return null

  // Use manual selection if provided, otherwise use AI recommendation
  const autoRec = recommendContainer(totalCBM)
  const primary = manualSelection || autoRec.primary
  const alternatives = manualSelection
    ? Object.keys(CONTAINERS).filter(k => k !== primary && k !== manualSelection)
    : autoRec.alternatives

  const c = CONTAINERS[primary]
  const fill = getFillPercent(totalCBM, primary)
  const isManual = manualSelection && manualSelection !== autoRec.primary

  return (
    <div className="mt-4">
      <h4 className="font-bold text-sm text-qgo-text mb-3 flex items-center gap-2">
        <Package className="w-4 h-4 text-qgo-blue" />
        Container Recommendation
        {isManual && (
          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Manual Selection
          </span>
        )}
      </h4>

      {/* Main recommendation */}
      <div className="bg-qgo-bg rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-qgo-text">{c.label}</p>
            <p className="text-xs text-gray-500">{formatCBM(totalCBM)} CBM used of {c.maxCBM} CBM</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black" style={{ color: c.color }}>{fill}%</p>
            <p className="text-xs text-gray-400">filled</p>
          </div>
        </div>

        {/* Container visualization */}
        <div className="relative h-16 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fill}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 flex items-center justify-center rounded-md"
            style={{ background: `linear-gradient(90deg, ${c.color}dd, ${c.color})` }}
          >
            {fill > 15 && (
              <span className="text-white text-xs font-bold px-2">
                📦 {formatCBM(totalCBM)} CBM
              </span>
            )}
          </motion.div>
          {/* Container door lines */}
          <div className="absolute inset-0 flex items-center justify-end pr-2 pointer-events-none">
            <div className="w-0.5 h-10 bg-gray-300/60 rounded" />
          </div>
        </div>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">Also consider:</p>
          <div className="flex gap-2 flex-wrap">
            {alternatives.map(key => {
              const alt = CONTAINERS[key]
              const altFill = getFillPercent(totalCBM, key)
              return (
                <div key={key} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs">
                  <p className="font-semibold text-qgo-text">{alt.label}</p>
                  <p className="text-gray-400">{altFill}% filled</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
