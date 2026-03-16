import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { CONTAINERS, getFillPercent } from '@/utils/cbm'

export default function CBMCounter({ totalCBM = 0, containerType = null, isManualOverride = false }) {
  // Determine container and fill percentage
  const container = CONTAINERS[containerType] || CONTAINERS['20ft']
  const fillPercent = Math.min(getFillPercent(totalCBM, containerType || '20ft'), 100)

  // Get fill color based on percentage
  const getFillColor = () => {
    if (fillPercent < 50) return 'bg-green-400'
    if (fillPercent < 75) return 'bg-yellow-400'
    if (fillPercent < 90) return 'bg-orange-400'
    return 'bg-red-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-4 text-white"
      style={{
        background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-primary) 100%)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-wide flex items-center gap-1">
            <Package size={12} />
            Total CBM
          </p>
          <motion.p
            key={totalCBM}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black"
          >
            {totalCBM.toFixed(2)}
          </motion.p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-xs flex items-center justify-end gap-1">
            {isManualOverride ? 'Selected' : 'Recommended'}
            {isManualOverride && <span className="text-amber-400">(Manual)</span>}
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--color-secondary)' }}>
            {container?.label || '—'}
          </p>
          <p className="text-xs text-white/50">{fillPercent}% full</p>
        </div>
      </div>

      {/* Fill bar */}
      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${getFillColor()}`}
        />
      </div>
      <div className="flex justify-between text-xs text-white/40 mt-1">
        <span>0 CBM</span>
        <span>{container?.maxCBM} CBM max</span>
      </div>
    </motion.div>
  )
}
