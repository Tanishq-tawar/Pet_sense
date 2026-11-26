import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { petsApi } from '../api/petsApi'
import { uploadsApi } from '../api/uploadsApi'
import { analysisApi } from '../api/analysisApi'
import {
  PawPrint, Edit2, Upload, ArrowLeft, Syringe, Heart, AlertTriangle,
  ClipboardList, Calendar, Weight, Ruler, User
} from 'lucide-react'
import toast from 'react-hot-toast'

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  )
}

export default function PetProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [vaccinations, setVaccinations] = useState([])
  const [uploads, setUploads] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      petsApi.getPet(id),
      petsApi.getVaccinations(id),
      uploadsApi.listUploads({ pet: id, page_size: 8 }),
      analysisApi.listAnalysis({ pet: id, page_size: 5 }),
    ]).then(([p, v, u, a]) => {
      setPet(p.data)
      setVaccinations(v.data.results || v.data)
      setUploads(u.data.results || u.data)
      setAnalyses(a.data.results || a.data)
    }).catch(() => toast.error('Failed to load pet profile.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!pet) return (
    <div className="card text-center py-16">
      <p className="text-slate-500">Pet not found.</p>
      <Link to="/pets" className="btn-primary mt-4">Back to Pets</Link>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/pets')} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 flex-1">{pet.name}</h1>
        <Link to={`/pets/${id}/edit`} className="btn-secondary text-sm">
          <Edit2 size={15} /> Edit
        </Link>
        <Link to={`/upload?pet=${id}`} className="btn-primary text-sm">
          <Upload size={15} /> Upload
        </Link>
      </div>

      {/* Profile card */}
      <div className="card flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 self-start">
          {pet.photo ? (
            <img src={pet.photo} alt={pet.name} className="w-28 h-28 rounded-2xl object-cover" />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-teal-50 flex items-center justify-center">
              <PawPrint size={44} className="text-teal-300" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">{pet.name}</h2>
          <p className="text-teal-600 font-medium text-sm">{pet.breed_name}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <InfoRow icon={User} label="Gender" value={pet.gender === 'M' ? 'Male' : pet.gender === 'F' ? 'Female' : pet.gender} />
            <InfoRow icon={Calendar} label="Date of Birth" value={pet.date_of_birth} />
            <InfoRow icon={Weight} label="Weight" value={pet.weight_kg ? `${pet.weight_kg} kg` : null} />
            <InfoRow icon={Ruler} label="Height" value={pet.height_cm ? `${pet.height_cm} cm` : null} />
            {pet.age_years != null && <InfoRow icon={Calendar} label="Age" value={`${pet.age_years} year${pet.age_years !== 1 ? 's' : ''}`} />}
          </div>
        </div>
      </div>

      {/* Health info */}
      {(pet.existing_conditions || pet.notes) && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Heart size={16} className="text-teal-600" /> Health Notes
          </h2>
          {pet.existing_conditions && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Existing conditions</p>
              <p className="text-sm text-slate-700">{pet.existing_conditions}</p>
            </div>
          )}
          {pet.notes && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Notes</p>
              <p className="text-sm text-slate-700">{pet.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Vaccinations */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Syringe size={16} className="text-teal-600" /> Vaccinations
        </h2>
        {vaccinations.length === 0 ? (
          <p className="text-slate-400 text-sm">No vaccinations recorded.</p>
        ) : (
          <div className="space-y-2">
            {vaccinations.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-700">{v.vaccine_name}</p>
                  <p className="text-xs text-slate-400">Date: {v.administered_date}</p>
                </div>
                {v.next_due_date && (
                  <span className="text-xs text-teal-600 font-medium">Next: {v.next_due_date}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent uploads */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Media Gallery</h2>
          <Link to={`/upload?pet=${id}`} className="text-xs text-teal-600 hover:underline font-medium">
            + Upload
          </Link>
        </div>
        {uploads.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No media uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {uploads.map(u => (
              <div key={u.id} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                {u.media_type === 'image' ? (
                  <img src={u.thumbnail || u.file} alt="upload"
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    Video
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent analyses */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <ClipboardList size={16} className="text-teal-600" /> Recent Analyses
          </h2>
          <Link to="/history" className="text-xs text-teal-600 hover:underline font-medium">View all</Link>
        </div>
        {analyses.length === 0 ? (
          <p className="text-slate-400 text-sm">No analyses yet for this pet.</p>
        ) : (
          <div className="space-y-2">
            {analyses.map(a => (
              <Link key={a.id} to={`/analysis/${a.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-400">{a.observations_count || 0} observation(s)</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  a.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>{a.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
