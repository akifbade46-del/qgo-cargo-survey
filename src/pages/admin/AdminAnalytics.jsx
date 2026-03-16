import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import { TrendingUp, DollarSign, Package, Users, BarChart3 } from 'lucide-react'
import { format, subDays, startOfDay } from 'date-fns'
import { formatCurrency } from '@/utils/pricing'

const COLORS = ['#0D5C9E','#90CCE0','#27AE60','#F39C12','#E74C3C','#8B5CF6']

export default function AdminAnalytics() {
  const [surveys, setSurveys]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [dailyData, setDailyData]     = useState([])
  const [statusData, setStatusData]   = useState([])
  const [containerData, setContainerData] = useState([])
  const [cityData, setCityData]       = useState([])
  const [revenueData, setRevenueData] = useState([])

  // Metrics
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('survey_requests')
      .select('id,status,from_city,to_country,move_type,created_at')
      .order('created_at', { ascending: true })

    const { data: reports } = await supabase
      .from('survey_reports')
      .select('recommended_container,total_cbm,estimated_cost,created_at')

    setSurveys(data || [])

    // Calculate total revenue and completed count
    const revenue = (reports || []).reduce((sum, r) => sum + (parseFloat(r.estimated_cost) || 0), 0)
    setTotalRevenue(revenue)
    setCompletedCount((data || []).filter(s => s.status === 'completed').length)

    // Revenue trend (last 6 months)
    const revenueByMonth = {}
    ;(reports || []).forEach(r => {
      if (r.estimated_cost) {
        const month = format(new Date(r.created_at), 'MMM yyyy')
        revenueByMonth[month] = (revenueByMonth[month] || 0) + parseFloat(r.estimated_cost)
      }
    })
    setRevenueData(Object.entries(revenueByMonth).slice(-6).map(([month, revenue]) => ({ month, revenue })))

    // Daily submissions (last 14 days)
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = subDays(new Date(), 13 - i)
      const label = format(d, 'MMM d')
      const dayStart = startOfDay(d).toISOString()
      const dayEnd = startOfDay(subDays(d, -1)).toISOString()
      const count = (data || []).filter(s =>
        s.created_at >= dayStart && s.created_at < dayEnd
      ).length
      return { date: label, surveys: count }
    })
    setDailyData(days)

    // Status distribution
    const statusCounts = {}
    ;(data || []).forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1 })
    setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace('_',' '), value })))

    // Container distribution
    const containerCounts = {}
    ;(reports || []).forEach(r => {
      if (r.recommended_container) {
        containerCounts[r.recommended_container] = (containerCounts[r.recommended_container] || 0) + 1
      }
    })
    setContainerData(Object.entries(containerCounts).map(([name, value]) => ({ name: name.replace('_',' '), value })))

    // Top cities
    const cityCounts = {}
    ;(data || []).forEach(s => {
      if (s.from_city) cityCounts[s.from_city] = (cityCounts[s.from_city] || 0) + 1
    })
    setCityData(
      Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([city, count]) => ({ city, count }))
    )

    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-qgo-blue border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-qgo-blue" />
        <h1 className="text-2xl font-bold text-qgo-text">Analytics</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Total Surveys"
          value={surveys?.length || 0}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Completed"
          value={completedCount}
          icon={BarChart3}
          color="purple"
        />
        <MetricCard
          title="Completion Rate"
          value={`${surveys?.length > 0 ? Math.round((completedCount / surveys.length) * 100) : 0}%`}
          icon={TrendingUp}
          color="cyan"
        />
      </div>


      <div className="space-y-6">
        {/* Daily Submissions */}
        <div className="card">
          <h2 className="font-bold text-qgo-text mb-4">Survey Submissions — Last 14 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="surveys" fill="#0D5C9E" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Pie */}
          <div className="card">
            <h2 className="font-bold text-qgo-text mb-4">Status Distribution</h2>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                    labelLine={false} fontSize={11}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-8 text-sm">No data yet</p>}
          </div>

          {/* Container Pie */}
          <div className="card">
            <h2 className="font-bold text-qgo-text mb-4">Container Recommendations</h2>
            {containerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={containerData} cx="50%" cy="50%" outerRadius={85}
                    dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false} fontSize={11}>
                    {containerData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-8 text-sm">No reports yet</p>}
          </div>
        </div>

        {/* Top Cities */}
        {cityData.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-qgo-text mb-4">Top Origin Cities</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="city" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#90CCE0" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, color }) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    cyan: 'bg-cyan-100 text-cyan-700'
  }

  return (
    <div className="card !p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-qgo-text mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}
