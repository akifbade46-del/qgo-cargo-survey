import { Link } from 'react-router-dom'
import { MapPin, Calendar, ChevronRight, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import StatusBadge from '@/components/common/StatusBadge'

export default function SurveyCard({ survey, index = 0 }) {
  // Format time slot from preferred_date
  const getTimeSlot = () => {
    if (!survey.preferred_date) return null
    const date = new Date(survey.preferred_date)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const timeSlot = getTimeSlot()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/surveyor/survey/${survey.id}`}
        className="surveyor-card flex items-center gap-4 hover:shadow-md transition-all cursor-pointer block"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
              {survey.reference_number}
            </span>
            <StatusBadge status={survey.status} />
          </div>
          <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {survey.customer_name}
          </p>
          <div className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            <MapPin size={12} />
            <span className="truncate">{survey.from_address || survey.from_city || 'Address not set'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {survey.preferred_date && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{new Date(survey.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
            {timeSlot && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{timeSlot}</span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} className="flex-shrink-0" />
      </Link>
    </motion.div>
  )
}
