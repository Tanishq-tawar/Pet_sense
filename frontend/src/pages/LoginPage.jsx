import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Stethoscope, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.detail) toast.error(data.detail)
      else setErrors(data || { detail: 'Login failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center">
              <Stethoscope size={20} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-xl">Pet Sense</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="label">Email address</label>
            <input
              className={`input ${errors.email ? 'border-red-400 ring-red-200' : ''}`}
              type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handle} required autoFocus
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                type={showPass ? 'text' : 'password'} name="password"
                placeholder="••••••••" value={form.password} onChange={handle} required
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errors.detail && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {errors.detail}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
