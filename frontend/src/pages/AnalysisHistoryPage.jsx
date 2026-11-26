import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { analysisApi } from '../api/analysisApi'
import { petsApi } from '../api/petsApi'
import { ClipboardList, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_COLORS = {
  completed: 'bg-green-50 text-green-700',
  processing: 'bg-blue-50 text-blue-700',
  failed: 'bg-red-50 text-red-600',
  pending: 'bg-amber-50 text-amber-700',
}

export default function AnalysisHistoryPage() {
  const [analyses, setAnalyses] = useState([])
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({ pet: '', status: '', search: '' })

  useEffect(() => {
    petsApi.listPets().then(r => setPets(r.data.results || r.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, page_size: 10 }
    if (filters.pet) params.pet = filters.pet
    if (filters.status) params.status = filters.status

    analysisApi.listAnalysis(params)
      .then(r => {
        const data = r.data
        if (data.results) {
          setAnalyses(data.results)
          setTotalPages(Math.ceil(data.count / 10))
        } else {
          setAnalyses(data)
          setTotalPages(1)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, filters.pet, filters.status])

  const setFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  const filtered = analyses.filter(a =>
    !filters.search ||
    a.pet_name?.toLowerCase().includes(filters.search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analysis History</h1>
        <p className="text-slate-500 text-sm mt-1">All preliminary observation reports for your pets.</p>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 text-sm" placeholder="Search by pet name…"
            value={filters.search} onChange={e => setFilter('search', e.target.value)} />
        </div>
        <select className="input text-sm w-auto"
          value={filters.pet} onChange={e => setFilter('pet', e.target.value)}>
          <option value="">All pets</option>
          {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input text-sm w-auto"
          value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400">No analyses found.</p>
            <Link to="/upload" className="btn-primary mt-4 text-sm">Upload media to start</Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Date</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Pet</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Observations</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-600">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5 text-slate-600">
                        {new Date(a.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-slate-700">{a.pet_name}</span>
                        {a.breed_name && <span className="text-slate-400 ml-1.5 text-xs">{a.breed_name}</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{a.observations_count ?? 0}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[a.status] || 'bg-slate-50 text-slate-600'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/analysis/${a.id}`}
                          className="text-teal-600 hover:underline font-medium text-xs">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 py-4 border-t border-slate-100">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
