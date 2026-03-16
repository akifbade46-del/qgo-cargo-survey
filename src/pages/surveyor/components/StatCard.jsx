import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, color = 'blue', trend }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    cyan: 'bg-cyan-100 text-cyan-700'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {trend && (
          <p className={`text-xs mt-0.5 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </motion.div>
  )
}
