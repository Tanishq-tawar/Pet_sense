import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { petsApi } from '../api/petsApi'
import { PawPrint, Plus, Edit2, Trash2, Loader2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

function PetCard({ pet, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete ${pet.name}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await petsApi.deletePet(pet.id)
      toast.success(`${pet.name} removed.`)
      onDelete(pet.id)
    } catch {
      toast.error('Could not delete pet.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="card hover:shadow-card-hover transition-shadow flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {pet.photo ? (
          <img src={pet.photo} alt={pet.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
            <PawPrint size={28} className="text-teal-600" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800 text-lg truncate">{pet.name}</h3>
          <p className="text-slate-500 text-sm">{pet.breed_name}</p>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {pet.gender && <span className="text-xs text-slate-400 capitalize">{pet.gender === 'M' ? 'Male' : pet.gender === 'F' ? 'Female' : ''}</span>}
            {pet.age_years != null && <span className="text-xs text-slate-400">· {pet.age_years}y</span>}
            {pet.weight_kg && <span className="text-xs text-slate-400">· {pet.weight_kg} kg</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <Link to={`/pets/${pet.id}`} className="btn-secondary text-xs py-1.5 flex-1 justify-center">
          View Profile
        </Link>
        <Link to={`/pets/${pet.id}/edit`} className="btn-secondary text-xs py-1.5 px-3">
          <Edit2 size={14} />
        </Link>
        <button onClick={handleDelete} disabled={deleting}
          className="btn-danger text-xs py-1.5 px-3">
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function MyPetsPage() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    petsApi.listPets().then(r => setPets(r.data.results || r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = pets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.breed_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Pets</h1>
          <p className="text-slate-500 text-sm mt-1">{pets.length} pet{pets.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Link to="/pets/new" className="btn-primary">
          <Plus size={16} /> Add Pet
        </Link>
      </div>

      {/* Search */}
      {pets.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search pets…" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <PawPrint size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">
            {search ? 'No pets match your search' : 'No pets yet'}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {search ? 'Try a different name or breed.' : 'Add your first pet to start monitoring their health.'}
          </p>
          {!search && <Link to="/pets/new" className="btn-primary">Add your first pet</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(pet => (
            <PetCard key={pet.id} pet={pet} onDelete={id => setPets(ps => ps.filter(p => p.id !== id))} />
          ))}
        </div>
      )}
    </div>
  )
}
