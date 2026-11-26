import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { analysisApi } from '../api/analysisApi'
import {
  ArrowLeft, AlertTriangle, CheckCircle, Eye, Ear, Heart,
  Activity, FileText, Download, Loader2, Info
} from 'lucide-react'
import toast from 'react-hot-toast'

const SEVERITY_CONFIG = {
  normal: { label: 'Normal', cls: 'badge-normal', icon: CheckCircle },
  watch: { label: 'Watch', cls: 'badge-watch', icon: Info },
  concern: { label: 'Concern', cls: 'badge-concern', icon: AlertTriangle },
  urgent: { label: 'Urgent', cls: 'badge-urgent', icon: AlertTriangle },
}

const CATEGORY_ICONS = {
  coat_skin: Heart,
  eyes: Eye,
  ears: Ear,
  posture: Activity,
  general: Info,
}

function ObservationCard({ obs }) {
  const cfg = SEVERITY_CONFIG[obs.severity] || SEVERITY_CONFIG.normal
  const Icon = CATEGORY_ICONS[obs.category] || Info
  const SevIcon = cfg.icon

  return (
    <div className="border border-slate-100 rounded-2xl p-4 space-y-3 hover:border-teal-100 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-teal-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{obs.title}</p>
            <p className="text-xs text-slate-400 capitalize">{obs.category?.replace('_', ' ')}</p>
          </div>
        </div>
        <span className={cfg.cls}>
          <SevIcon size={11} className="mr-1" />
          {cfg.label}
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{obs.description}</p>
      {obs.recommendation && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 text-xs">
          <Info size={13} className="mt-0.5 flex-shrink-0" />
          <span>{obs.recommendation}</span>
        </div>
      )}
    </div>
  )
}

export default function AnalysisResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    analysisApi.getAnalysis(id)
      .then(r => setAnalysis(r.data))
      .catch(() => toast.error('Could not load analysis.'))
      .finally(() => setLoading(false))
  }, [id])

  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const { data } = await analysisApi.downloadPDF(id)
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `PetSense_Report_${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Could not download PDF.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!analysis) return (
    <div className="card text-center py-16">
      <p className="text-slate-500">Analysis not found.</p>
      <Link to="/history" className="btn-primary mt-4">View History</Link>
    </div>
  )

  const observations = analysis.observations || []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">Analysis Report</h1>
          <p className="text-slate-500 text-sm">{new Date(analysis.created_at).toLocaleString()}</p>
        </div>
        <button onClick={downloadPDF} disabled={downloading} className="btn-secondary text-sm">
          {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {downloading ? 'Downloading…' : 'Download PDF'}
        </button>
      </div>

      {/* Summary card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {analysis.upload_thumbnail && (
            <img src={analysis.upload_thumbnail} alt="Uploaded"
              className="w-24 h-24 rounded-2xl object-cover flex-shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Pet:</span>
              <span className="text-sm font-semibold text-slate-700">{analysis.pet_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Breed:</span>
              <span className="text-sm text-slate-700">{analysis.breed_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                analysis.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}>{analysis.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Observations:</span>
              <span className="text-sm text-slate-700">{observations.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary text */}
      {analysis.summary && (
        <div className="card">
          <div className="flex items-start gap-3">
            <FileText size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Summary</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{analysis.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Observations */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-4">
          Preliminary Observations ({observations.length})
        </h2>
        {observations.length === 0 ? (
          <div className="card text-center py-10 text-slate-400">
            <CheckCircle size={32} className="mx-auto mb-3 text-green-400" />
            <p className="font-medium text-slate-600">No observations flagged</p>
            <p className="text-sm mt-1">No specific abnormal areas were flagged for this upload.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {observations.map(obs => <ObservationCard key={obs.id} obs={obs} />)}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="card border-amber-100 bg-amber-50">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm mb-1">Veterinary Disclaimer</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              Pet Sense provides preliminary visual observations only. This is not a veterinary diagnosis.
              All observations must be confirmed by a qualified veterinarian. Do not make medical decisions
              based solely on this report. If you have concerns about your pet's health, please consult a
              veterinarian promptly.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/history" className="btn-secondary flex-1 justify-center">View All Reports</Link>
        <Link to="/upload" className="btn-primary flex-1 justify-center">New Upload</Link>
      </div>
    </div>
  )
}
