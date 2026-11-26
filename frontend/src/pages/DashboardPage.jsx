import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { petsApi } from '../api/petsApi'
import { uploadsApi } from '../api/uploadsApi'
import { analysisApi } from '../api/analysisApi'
import { remindersApi } from '../api/remindersApi'
import {
  PawPrint, Upload, ClipboardList, Bell, TrendingUp, ArrowRight, AlertTriangle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

function StatCard({ icon: Icon, label, value, to, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <Link to={to} className="card hover:shadow-card-hover transition-shadow flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [uploads, setUploads] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      petsApi.listPets(),
      uploadsApi.listUploads({ page_size: 5 }),
      analysisApi.listAnalysis({ page_size: 5 }),
      remindersApi.listReminders({ is_completed: false, page_size: 5 }),
    ]).then(([p, u, a, r]) => {
      setPets(p.data.results || p.data)
      setUploads((u.data.results || u.data).slice(0, 4))
      setAnalyses((a.data.results || a.data).slice(0, 4))
      setReminders((r.data.results || r.data).slice(0, 3))
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Build chart data from last 7 analyses
  const chartData = (() => {
    const counts = {}
    analyses.forEach(a => {
      const d = new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      counts[d] = (counts[d] || 0) + 1
    })
    return Object.entries(counts).map(([date, count]) => ({ date, count }))
  })()

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const firstName = user?.first_name || user?.username || 'there'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Good day, {firstName}! 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Here's an overview of your pets' health monitoring.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={PawPrint} label="My Pets" value={pets.length} to="/pets" color="teal" />
        <StatCard icon={Upload} label="Uploads" value={uploads.length} to="/upload" color="blue" />
        <StatCard icon={ClipboardList} label="Analyses" value={analyses.length} to="/history" color="green" />
        <StatCard icon={Bell} label="Reminders" value={reminders.length} to="/reminders" color="amber" />
      </div>

      {/* Chart + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-teal-600" />
              Analysis Activity
            </h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} fill="url(#tealGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-sm">
              <TrendingUp size={32} className="mb-2 opacity-30" />
              Upload media and run analyses to see activity here
            </div>
          )}
        </div>

        {/* Upcoming reminders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Upcoming Reminders</h2>
            <Link to="/reminders" className="text-xs text-teal-600 hover:underline font-medium">View all</Link>
          </div>
          {reminders.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-8">No pending reminders</div>
          ) : (
            <div className="space-y-3">
              {reminders.map(r => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <Bell size={15} className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.title}</p>
                    <p className="text-xs text-slate-400">{new Date(r.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent analyses */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Recent Analyses</h2>
          <Link to="/history" className="text-xs text-teal-600 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {analyses.length === 0 ? (
          <div className="text-center py-10">
            <ClipboardList size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">No analyses yet.</p>
            <Link to="/upload" className="btn-primary mt-4 text-sm py-2">Upload media to start</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {analyses.map(a => (
              <Link key={a.id} to={`/analysis/${a.id}`}
                className="flex items-center gap-4 py-3 hover:bg-slate-50 rounded-xl px-2 transition">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 font-bold text-xs flex-shrink-0">
                  {a.pet_name?.[0] || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{a.pet_name}</p>
                  <p className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  a.status === 'completed'
                    ? 'bg-green-50 text-green-700'
                    : a.status === 'failed'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {a.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* My Pets quick view */}
      {pets.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">My Pets</h2>
            <Link to="/pets" className="text-xs text-teal-600 hover:underline font-medium flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {pets.map(pet => (
              <Link key={pet.id} to={`/pets/${pet.id}`}
                className="flex flex-col items-center p-3 rounded-xl border border-slate-100 hover:bg-teal-50 hover:border-teal-100 transition text-center">
                {pet.photo ? (
                  <img src={pet.photo} alt={pet.name}
                    className="w-12 h-12 rounded-full object-cover mb-2" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                    <PawPrint size={22} className="text-teal-600" />
                  </div>
                )}
                <p className="text-sm font-medium text-slate-700 truncate w-full">{pet.name}</p>
                <p className="text-xs text-slate-400">{pet.breed_name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
