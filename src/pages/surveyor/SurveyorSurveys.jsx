import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, RefreshCw, ClipboardList } from 'lucide-react'
import SurveyCard from './components/SurveyCard'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'assigned', label: 'Active' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'surveyed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

export default function SurveyorSurveys() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [filteredSurveys, setFilteredSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [surveyorId, setSurveyorId] = useState(null)

  useEffect(() => {
    loadSurveys()
  }, [user])

  useEffect(() => {
    filterSurveys()
  }, [surveys, search, activeFilter])

  async function loadSurveys() {
    setLoading(true)
    try {
      // Get surveyor ID
      const { data: surveyor } = await supabase
        .from('surveyors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!surveyor) {
        setLoading(false)
        return
      }

      setSurveyorId(surveyor.id)

      // Load all surveys for this surveyor
      const { data } = await supabase
        .from('survey_requests')
        .select(`
          id,
          reference_number,
          customer_name,
          from_address,
          from_city,
          from_country,
          preferred_date,
          status,
          created_at
        `)
        .eq('assigned_surveyor_id', surveyor.id)
        .order('preferred_date', { ascending: true })

      setSurveys(data || [])
    } catch (err) {
      console.error('Failed to load surveys:', err)
    } finally {
      setLoading(false)
    }
  }

  function filterSurveys() {
    let filtered = [...surveys]

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(s => s.status === activeFilter)
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(s =>
        s.reference_number?.toLowerCase().includes(searchLower) ||
        s.customer_name?.toLowerCase().includes(searchLower) ||
        s.from_address?.toLowerCase().includes(searchLower) ||
        s.from_city?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredSurveys(filtered)
  }

  // Group surveys by date
  const groupedSurveys = filteredSurveys.reduce((groups, survey) => {
    const date = survey.preferred_date
      ? new Date(survey.preferred_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'No Date'

    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(survey)
    return groups
  }, {})

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Surveys</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {filteredSurveys.length} {filteredSurveys.length === 1 ? 'survey' : 'surveys'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-tertiary)' }}
        />
        <input
          type="text"
          placeholder="Search by reference, customer, address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-color)'
          }}
        />
        {loading && (
          <RefreshCw
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
            style={{ color: 'var(--color-primary)' }}
          />
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(filter => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeFilter === filter.value ? 'var(--color-primary)' : 'var(--bg-secondary)',
              color: activeFilter === filter.value ? 'white' : 'var(--text-secondary)'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Surveys List */}
      <div className="space-y-6">
        {Object.keys(groupedSurveys).length > 0 ? (
          Object.entries(groupedSurveys).map(([date, dateSurveys]) => (
            <motion.section
              key={date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xs font-medium uppercase tracking-wide mb-2 px-1" style={{ color: 'var(--text-tertiary)' }}>
                {date}
              </h3>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {dateSurveys.map((survey, index) => (
                    <SurveyCard key={survey.id} survey={survey} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <ClipboardList size={48} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>
              {search ? 'No surveys match your search' : 'No surveys found'}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {search ? 'Try adjusting your search or filter' : 'New assignments will appear here'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
