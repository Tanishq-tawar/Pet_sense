import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { petsApi } from '../api/petsApi'
import { uploadsApi } from '../api/uploadsApi'
import { analysisApi } from '../api/analysisApi'
import {
  Upload, Image, Video, X, CheckCircle, Loader2, Zap, AlertTriangle, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/quicktime']
const MAX_SIZE_MB = 50

export default function UploadMediaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const preselectedPet = searchParams.get('pet')

  const [pets, setPets] = useState([])
  const [selectedPet, setSelectedPet] = useState(preselectedPet || '')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploaded, setUploaded] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisId, setAnalysisId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    petsApi.listPets().then(r => {
      const list = r.data.results || r.data
      setPets(list)
      if (!preselectedPet && list.length === 1) setSelectedPet(String(list[0].id))
    })
  }, [preselectedPet])

  const onDrop = useCallback((accepted, rejected) => {
    setError('')
    if (rejected.length > 0) {
      setError(`File rejected: ${rejected[0].errors[0]?.message}`)
      return
    }
    const f = accepted[0]
    setFile(f)
    if (f.type.startsWith('image/')) {
      setPreview({ type: 'image', url: URL.createObjectURL(f) })
    } else {
      setPreview({ type: 'video', url: URL.createObjectURL(f) })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'video/*': ['.mp4', '.mov'] },
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    maxFiles: 1,
  })

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setUploaded(null)
    setAnalysisId(null)
    setUploadProgress(0)
    setError('')
  }

  const handleUpload = async () => {
    if (!file || !selectedPet) return
    setError('')
    setUploading(true)
    setUploadProgress(10)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('pet', selectedPet)
    fd.append('description', '')

    try {
      const { data } = await uploadsApi.createUpload(fd)
      setUploaded(data)
      setUploadProgress(100)
      toast.success('File uploaded successfully!')
    } catch (err) {
      const msg = err.response?.data?.file?.[0] || err.response?.data?.detail || 'Upload failed.'
      setError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!uploaded) return
    setAnalyzing(true)
    try {
      const { data } = await analysisApi.runAnalysis(uploaded.id)
      setAnalysisId(data.id)
      toast.success('Analysis complete!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload Media</h1>
        <p className="text-slate-500 text-sm mt-1">Upload a photo or video of your pet for preliminary observation.</p>
      </div>

      {/* Pet selector */}
      <div className="card space-y-3">
        <label className="label">Select Pet <span className="text-red-400">*</span></label>
        <select className="input" value={selectedPet} onChange={e => setSelectedPet(e.target.value)}>
          <option value="">Choose a pet…</option>
          {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.breed_name})</option>)}
        </select>
        {pets.length === 0 && (
          <p className="text-sm text-amber-600">
            No pets yet — <a href="/pets/new" className="underline font-medium">add a pet first</a>.
          </p>
        )}
      </div>

      {/* Dropzone */}
      <div className="card">
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
              ${isDragActive ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}
          >
            <input {...getInputProps()} />
            <div className="flex justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center">
                <Image size={24} className="text-teal-500" />
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Video size={24} className="text-blue-500" />
              </div>
            </div>
            <p className="font-semibold text-slate-700 mb-1">
              {isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-slate-400 text-sm">JPG, PNG, WebP, MP4, MOV — max {MAX_SIZE_MB}MB</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 max-h-72 flex items-center justify-center">
              {preview?.type === 'image' ? (
                <img src={preview.url} alt="preview" className="max-h-72 max-w-full object-contain" />
              ) : (
                <video src={preview?.url} controls className="max-h-72 max-w-full" />
              )}
              {!uploaded && (
                <button onClick={clearFile}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-slate-600 hover:text-red-500">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* File info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              {file.type.startsWith('image') ? <Image size={18} className="text-teal-600" /> : <Video size={18} className="text-blue-600" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              {uploaded && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
            </div>

            {/* Progress */}
            {uploading && (
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl">
            <AlertTriangle size={15} /> {error}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {!uploaded ? (
          <button className="btn-primary w-full" onClick={handleUpload}
            disabled={!file || !selectedPet || uploading}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Uploading…' : 'Upload File'}
          </button>
        ) : (
          <>
            {!analysisId ? (
              <button className="btn-primary w-full" onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {analyzing ? 'Analyzing… (this may take a moment)' : 'Run AI Preliminary Analysis'}
              </button>
            ) : (
              <button className="btn-primary w-full"
                onClick={() => navigate(`/analysis/${analysisId}`)}>
                View Analysis Report <ArrowRight size={16} />
              </button>
            )}
            <button className="btn-secondary w-full" onClick={clearFile}>
              Upload Another File
            </button>
          </>
        )}
      </div>
    </div>
  )
}
