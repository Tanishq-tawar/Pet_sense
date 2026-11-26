import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authApi } from '../api/authApi'
import { Stethoscope, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

function FormField({ name, label, type = 'text', placeholder, required = false, value, onChange, error }) {
  return (
    <div>
      <label className="label">{label}</label>
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

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', username: '', first_name: '', last_name: '',
    password: '', password2: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (form.password !== form.password2) {
      setErrors({ password2: 'Passwords do not match.' })
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      // Load user via login context
      await login({ email: form.email, password: form.password })
      toast.success('Account created! Welcome to Pet Sense.')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data || {}
      setErrors(data)
      if (typeof data === 'string') toast.error(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center">
              <Stethoscope size={20} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-xl">Pet Sense</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-800">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Start monitoring your dog's health</p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              name="first_name"
              label="First name"
              placeholder="John"
              value={form.first_name}
              onChange={handle}
              error={errors.first_name}
            />
            <FormField
              name="last_name"
              label="Last name"
              placeholder="Doe"
              value={form.last_name}
              onChange={handle}
              error={errors.last_name}
            />
          </div>
          <FormField
            name="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={handle}
            error={errors.email}
          />
          <FormField
            name="username"
            label="Username"
            placeholder="johndoe"
            required
            value={form.username}
            onChange={handle}
            error={errors.username}
          />

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                type={showPass ? 'text' : 'password'} name="password"
                placeholder="Min. 8 characters" value={form.password} onChange={handle} required minLength={8}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{[errors.password].flat().join(' ')}</p>}
          </div>

          <div>
            <label className="label">Confirm password</label>
            <input
              className={`input ${errors.password2 ? 'border-red-400' : ''}`}
              type="password" name="password2"
              placeholder="Repeat password" value={form.password2} onChange={handle} required
            />
            {errors.password2 && <p className="text-red-500 text-xs mt-1">{errors.password2}</p>}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            By creating an account, you acknowledge that Pet Sense provides preliminary
            observations only and is not a veterinary service.
          </p>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
