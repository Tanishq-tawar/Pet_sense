import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authApi } from '../api/authApi'
import { User, Lock, Camera, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef()

  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    phone: user?.phone || '',
  })

  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [pwErrors, setPwErrors] = useState({})

  const handleProfileChange = e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }))
  const handlePwChange = e => setPasswords(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleAvatarChange = e => {
    const f = e.target.files[0]
    if (!f) return
    setAvatar(f)
    setAvatarPreview(URL.createObjectURL(f))
  }

  const saveProfile = async e => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSaved(false)
    const fd = new FormData()
    Object.entries(profile).forEach(([k, v]) => fd.append(k, v))
    if (avatar) fd.append('avatar', avatar)
    try {
      const { data } = await authApi.updateProfile(fd)
      updateUser(data)
      setProfileSaved(true)
      toast.success('Profile updated!')
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async e => {
    e.preventDefault()
    setPwErrors({})
    if (passwords.new_password !== passwords.confirm) {
      setPwErrors({ confirm: 'Passwords do not match.' })
      return
    }
    setSavingPw(true)
    try {
      await authApi.changePassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      })
      setPasswords({ old_password: '', new_password: '', confirm: '' })
      toast.success('Password changed successfully!')
    } catch (err) {
      const data = err.response?.data || {}
      setPwErrors(data)
      toast.error('Could not change password.')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile and security settings.</p>
      </div>

      {/* Profile */}
      <div className="card space-y-5">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <User size={18} className="text-teal-600" /> Profile Information
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center">
                <span className="text-teal-700 font-bold text-xl">
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
            )}
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center text-white shadow">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">{user?.email}</p>
            <button onClick={() => fileRef.current?.click()}
              className="text-xs text-teal-600 hover:underline mt-0.5">Change avatar</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <form onSubmit={saveProfile} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">First Name</label>
            <input className="input" name="first_name" value={profile.first_name}
              onChange={handleProfileChange} placeholder="John" />
          </div>
          <div>
            <label className="label">Last Name</label>
            <input className="input" name="last_name" value={profile.last_name}
              onChange={handleProfileChange} placeholder="Doe" />
          </div>
          <div>
            <label className="label">Username</label>
            <input className="input" name="username" value={profile.username}
              onChange={handleProfileChange} placeholder="johndoe" required />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" name="phone" value={profile.phone}
              onChange={handleProfileChange} placeholder="+1 555 000 0000" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="btn-primary" disabled={savingProfile}>
              {savingProfile
                ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                : profileSaved
                ? <><CheckCircle size={15} /> Saved!</>
                : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="card space-y-5">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Lock size={18} className="text-teal-600" /> Change Password
        </h2>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input className={`input ${pwErrors.old_password ? 'border-red-400' : ''}`}
              type="password" name="old_password" value={passwords.old_password}
              onChange={handlePwChange} required />
            {pwErrors.old_password && <p className="text-red-500 text-xs mt-1">{[pwErrors.old_password].flat().join(' ')}</p>}
          </div>
          <div>
            <label className="label">New Password</label>
            <input className={`input ${pwErrors.new_password ? 'border-red-400' : ''}`}
              type="password" name="new_password" value={passwords.new_password}
              onChange={handlePwChange} required minLength={8} />
            {pwErrors.new_password && <p className="text-red-500 text-xs mt-1">{[pwErrors.new_password].flat().join(' ')}</p>}
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input className={`input ${pwErrors.confirm ? 'border-red-400' : ''}`}
              type="password" name="confirm" value={passwords.confirm}
              onChange={handlePwChange} required />
            {pwErrors.confirm && <p className="text-red-500 text-xs mt-1">{pwErrors.confirm}</p>}
          </div>
          <button type="submit" className="btn-primary" disabled={savingPw}>
            {savingPw ? <><Loader2 size={15} className="animate-spin" /> Changing…</> : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-3">Account Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-700">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Member since</span>
            <span className="font-medium text-slate-700">
              {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
