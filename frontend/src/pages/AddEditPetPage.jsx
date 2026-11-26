import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { petsApi } from '../api/petsApi'
import { Loader2, Upload, PawPrint, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const GENDERS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'U', label: 'Unknown' },
]

function FormField({ name, label, type = 'text', placeholder, required, value, onChange, error }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <input
        className={`input ${error ? 'border-red-400' : ''}`}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange}
        required={required}
      />
      {error && <p className="text-red-500 text-xs mt-1">{[error].flat().join(' ')}</p>}
    </div>
  )
}

export default function AddEditPetPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const fileRef = useRef()

  const [breeds, setBreeds] = useState([])
  const [form, setForm] = useState({
    name: '', breed: '', gender: 'U', date_of_birth: '',
    weight_kg: '', height_cm: '', microchip_id: '', notes: '',
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    petsApi.getBreeds().then(r => setBreeds(r.data.results || r.data))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    petsApi.getPet(id)
      .then(({ data }) => {
        setForm({
          name: data.name || '',
          breed: data.breed || '',
          gender: data.gender || 'U',
          date_of_birth: data.date_of_birth || '',
          weight_kg: data.weight_kg || '',
          height_cm: data.height_cm || '',
          microchip_id: data.microchip_id || '',
          notes: data.notes || '',
        })
        if (data.photo) setPhotoPreview(data.photo)
      })
      .catch(() => toast.error('Could not load pet data.'))
      .finally(() => setFetchLoading(false))
  }, [id, isEdit])

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handlePhoto = e => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const submit = async e => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (photo) fd.append('photo', photo)

    try {
      if (isEdit) {
        await petsApi.updatePet(id, fd)
        toast.success('Pet updated!')
        navigate(`/pets/${id}`)
      } else {
        const { data } = await petsApi.createPet(fd)
        toast.success(`${data.name} added!`)
        navigate(`/pets/${data.id}`)
      }
    } catch (err) {
      const data = err.response?.data || {}
      setErrors(data)
      toast.error('Please fix the errors below.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Pet' : 'Add New Pet'}</h1>
          <p className="text-slate-500 text-sm">{isEdit ? "Update your pet's profile" : 'Create a profile for your dog'}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Photo upload */}
        <div className="card flex flex-col items-center gap-4">
          <div className="relative">
            {photoPreview ? (
              <img src={photoPreview} alt="Pet" className="w-24 h-24 rounded-2xl object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-teal-50 flex items-center justify-center">
                <PawPrint size={36} className="text-teal-300" />
              </div>
            )}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="btn-secondary text-sm py-2 gap-2">
            <Upload size={15} /> {photoPreview ? 'Change photo' : 'Upload photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-700">Basic Information</h2>
          <FormField
            name="name"
            label="Pet Name"
            placeholder="e.g. Buddy"
            required
            value={form.name}
            onChange={handle}
            error={errors.name}
          />

          <div>
            <label className="label">Breed <span className="text-red-400">*</span></label>
            <select className={`input ${errors.breed ? 'border-red-400' : ''}`}
              name="breed" value={form.breed} onChange={handle} required>
              <option value="">Select breed…</option>
              {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Gender</label>
              <select className="input" name="gender" value={form.gender} onChange={handle}>
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <FormField
              name="date_of_birth"
              label="Date of Birth"
              type="date"
              value={form.date_of_birth}
              onChange={handle}
              error={errors.date_of_birth}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="weight_kg"
              label="Weight (kg)"
              type="number"
              placeholder="e.g. 28.5"
              value={form.weight_kg}
              onChange={handle}
              error={errors.weight_kg}
            />
            <FormField
              name="height_cm"
              label="Height (cm)"
              type="number"
              placeholder="e.g. 60"
              value={form.height_cm}
              onChange={handle}
              error={errors.height_cm}
            />
          </div>

          <FormField
            name="microchip_id"
            label="Microchip ID"
            placeholder="e.g. 985112345678901"
            value={form.microchip_id}
            onChange={handle}
            error={errors.microchip_id}
          />
        </div>

        {/* Health notes */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-700">Health &amp; Notes</h2>
          <div>
            <label className="label">Notes (conditions, allergies, etc.)</label>
            <textarea className="input h-28 resize-none" name="notes"
              placeholder="Existing conditions, known allergies, medications, or any other notes…"
              value={form.notes} onChange={handle} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Pet'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Cancel</button>
        </div>
      </form>
    </div>
  )
}
