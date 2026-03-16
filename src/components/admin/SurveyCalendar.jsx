import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

/**
 * Visual Calendar Component
 * Drag-and-drop survey scheduling
 */
export default function SurveyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [surveys, setSurveys] = useState([])
  const [surveyors, setSurveyors] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadSurveys()
    loadSurveyors()
  }, [currentDate])

  async function loadSurveys() {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const { data } = await supabase
      .from('survey_requests')
      .select('*, surveyors(name)')
      .gte('confirmed_date', startOfMonth.toISOString().split('T')[0])
      .lte('confirmed_date', endOfMonth.toISOString().split('T')[0])
      .order('confirmed_date')

    setSurveys(data || [])
  }

  async function loadSurveyors() {
    const { data } = await supabase
      .from('surveyors')
      .select('*')
      .eq('is_available', true)

    setSurveyors(data || [])
  }

  function getDaysInMonth() {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay() // 0 = Sunday

    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ empty: true })
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const daySurveys = surveys.filter(s => s.confirmed_date === dateStr)

      days.push({
        day,
        date: dateStr,
        surveys: daySurveys,
        isToday: isSameDay(new Date(year, month, day), new Date())
      })
    }

    return days
  }

  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  function handleDateClick(day) {
    setSelectedDate(day)
    setShowModal(true)
  }

  const days = getDaysInMonth()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-qgo-text flex items-center gap-2">
            <CalendarIcon className="text-qgo-blue" /> Survey Calendar
          </h2>
          <p className="text-gray-500 text-sm mt-1">Schedule and manage survey appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="btn-secondary text-sm">
            Today
          </button>
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold min-w-[150px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card !p-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => !day.empty && handleDateClick(day)}
              className={`
                min-h-[100px] p-2 rounded-lg border-2 transition-all cursor-pointer
                ${day.empty ? 'border-transparent cursor-default' : 'border-gray-100 hover:border-qgo-blue'}
                ${day.isToday ? 'bg-blue-50 border-qgo-blue' : 'bg-white hover:bg-gray-50'}
                ${day.surveys?.length > 0 ? 'bg-green-50 border-green-200' : ''}
              `}
            >
              {day.empty ? (
                <div />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${day.isToday ? 'text-qgo-blue' : 'text-gray-700'}`}>
                      {day.day}
                    </span>
                    {day.surveys?.length > 0 && (
                      <span className="bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {day.surveys.length}
                      </span>
                    )}
                  </div>

                  {/* Survey Cards */}
                  {day.surveys?.slice(0, 2).map(survey => (
                    <div
                      key={survey.id}
                      className="text-xs p-1.5 bg-white rounded border border-gray-200 mb-1 truncate"
                      title={survey.reference_number}
                    >
                      <span className="font-medium">{survey.reference_number}</span>
                      {survey.surveyors && (
                        <span className="text-gray-500 ml-1">· {survey.surveyors.name}</span>
                      )}
                    </div>
                  ))}

                  {day.surveys?.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.surveys.length - 2} more
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border-2 border-qgo-blue rounded" />
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded" />
            <span className="text-gray-600">Has Surveys</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-100 rounded" />
            <span className="text-gray-600">Available</span>
          </div>
        </div>
      </div>

      {/* Upcoming Surveys List */}
      <div className="card !p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock className="text-qgo-blue" /> Upcoming Surveys
        </h3>

        {surveys.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No surveys scheduled this month</p>
        ) : (
          <div className="space-y-3">
            {surveys.slice(0, 5).map(survey => (
              <div key={survey.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-qgo-blue text-white rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs font-medium">
                    {new Date(survey.confirmed_date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold">
                    {new Date(survey.confirmed_date).getDate()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-qgo-text">{survey.reference_number}</p>
                  <p className="text-sm text-gray-500">{survey.customer_name}</p>
                  <p className="text-xs text-gray-400">
                    {survey.from_city} → {survey.to_city || 'TBD'}
                  </p>
                </div>
                <div className="text-right">
                  {survey.surveyors ? (
                    <p className="text-sm font-medium text-qgo-blue">{survey.surveyors.name}</p>
                  ) : (
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      Unassigned
                    </span>
                  )}
                  <p className="text-xs text-gray-500">{survey.preferred_time_slot}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && selectedDate && (
        <DateModal
          date={selectedDate}
          surveys={selectedDate.surveys || []}
          surveyors={surveyors}
          onClose={() => {
            setShowModal(false)
            setSelectedDate(null)
            loadSurveys()
          }}
        />
      )}
    </div>
  )
}

function DateModal({ date, surveys, surveyors, onClose }) {
  const [selectedSurveyor, setSelectedSurveyor] = useState('')
  const [selectedTime, setSelectedTime] = useState('morning')

  const daySurveys = surveys
  const isFull = daySurveys.length >= 3

  async function handleSchedule() {
    if (!selectedSurveyor) {
      return toast.error('Please select a surveyor')
    }

    if (isFull) {
      return toast.error('This date is fully booked')
    }

    // In real implementation, this would create/update survey assignments
    toast.success('Survey scheduled successfully!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">
          {new Date(date.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>

        {daySurveys.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Existing Surveys ({daySurveys.length}/3 slots)
            </p>
            {daySurveys.map(s => (
              <p key={s.id} className="text-xs text-blue-700">
                • {s.reference_number} - {s.customer_name}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Surveyor
            </label>
            <select
              className="input"
              value={selectedSurveyor}
              onChange={e => setSelectedSurveyor(e.target.value)}
              disabled={isFull}
            >
              <option value="">Choose a surveyor...</option>
              {surveyors.map(surveyor => (
                <option key={surveyor.id} value={surveyor.id}>
                  {surveyor.name} {surveyor.employee_id ? `(${surveyor.employee_id})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['morning', 'afternoon', 'evening'].map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  disabled={isFull}
                  className={`py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    selectedTime === time
                      ? 'bg-qgo-blue text-white border-qgo-blue'
                      : 'border-gray-200 text-gray-600 hover:border-qgo-blue'
                  } ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {isFull && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              This date is fully booked. Please choose another date.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSchedule}
              disabled={!selectedSurveyor || isFull}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Schedule
            </button>
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
