import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { ClipboardList, CheckCircle, Calendar, Clock, MapPin, ChevronRight, Camera, Mic, Package } from 'lucide-react'
import StatCard from './components/StatCard'
import SurveyCard from './components/SurveyCard'

export default function SurveyorDashboard() {
  const { user, profile } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [todaySurveys, setTodaySurveys] = useState([])
  const [stats, setStats] = useState({ active: 0, completed: 0, today: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadDashboard()
  }, [user])

  async function loadDashboard() {
    setLoading(true)
    try {
      // Get today's date range
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0))
      const endOfDay = new Date(today.setHours(23, 59, 59, 999))

      // Load all surveys for this surveyor
      const { data: allSurveys } = await supabase
        .from('survey_requests')
        .select('id, reference_number, customer_name, from_address, from_city, from_country, preferred_date, status, created_at')
        .eq('assigned_surveyor_id', (await supabase.from('surveyors').select('id').eq('user_id', user.id).single()).data?.id)
        .order('preferred_date', { ascending: true })

      // Calculate stats
      const activeSurveys = allSurveys?.filter(s => ['assigned', 'in_progress'].includes(s.status)) || []
      const completedSurveys = allSurveys?.filter(s => s.status === 'surveyed') || []
      const todaysSurveys = allSurveys?.filter(s => {
        if (!s.preferred_date) return false
        const surveyDate = new Date(s.preferred_date)
        return surveyDate >= startOfDay && surveyDate <= endOfDay
      }) || []

      setSurveys(activeSurveys.slice(0, 5))
      setTodaySurveys(todaysSurveys)
      setStats({
        active: activeSurveys.length,
        completed: completedSurveys.length,
        today: todaysSurveys.length
      })
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-t-transparent rounded-full"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Surveyor'}!
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Here's your overview for today
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={ClipboardList}
          label="Active"
          value={stats.active}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Done"
          value={stats.completed}
          color="green"
        />
        <StatCard
          icon={Calendar}
          label="Today"
          value={stats.today}
          color="orange"
        />
      </div>

      {/* Today's Surveys */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Today's Surveys</h2>
          <Link
            to="/surveyor/surveys"
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: 'var(--color-primary)' }}
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {todaySurveys.length > 0 ? (
          <div className="space-y-3">
            {todaySurveys.map((survey, index) => (
              <SurveyCard key={survey.id} survey={survey} index={index} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl p-6 text-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <Calendar size={32} className="mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No surveys scheduled for today</p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Enjoy your day!</p>
          </div>
        )}
      </motion.section>

      {/* Recent Active Surveys */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Active Surveys</h2>
          <Link
            to="/surveyor/surveys"
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: 'var(--color-primary)' }}
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {surveys.length > 0 ? (
          <div className="space-y-3">
            {surveys.map((survey, index) => (
              <SurveyCard key={survey.id} survey={survey} index={index} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl p-6 text-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <ClipboardList size={32} className="mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No active surveys</p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>New assignments will appear here</p>
          </div>
        )}
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
              <Camera size={24} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Photo</span>
          </button>
          <button
            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100 text-orange-600">
              <Mic size={24} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Voice</span>
          </button>
          <Link
            to="/surveyor/surveys"
            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100 text-green-600">
              <Package size={24} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Add Item</span>
          </Link>
        </div>
      </motion.section>
    </div>
  )
}
