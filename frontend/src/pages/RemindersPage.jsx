import { useState, useEffect } from 'react'
import { remindersApi } from '../api/remindersApi'
import { petsApi } from '../api/petsApi'
import {
  Bell, Plus, Trash2, CheckCircle, Loader2, AlertTriangle, Edit2, X, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

const REMINDER_TYPES = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'vet_checkup', label: 'Vet Checkup' },
  { value: 'follow_up', label: 'Follow-Up' },
  { value: 'medication', label: 'Medication' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'other', label: 'Other' },
]

function ReminderModal({ reminder, pets, onSave, onClose }) {
  const [form, setForm] = useState({
    title: reminder?.title || '',
    reminder_type: reminder?.reminder_type || 'vet_checkup',
    due_date: reminder?.due_date ? reminder.due_date.slice(0, 16) : '',
    notes: reminder?.notes || '',
    pet: reminder?.pet || '',
  })
  const [saving, setSaving] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (reminder?.id) {
        const { data } = await remindersApi.updateReminder(reminder.id, form)
        onSave(data, 'update')
      } else {
        const { data } = await remindersApi.createReminder(form)
        onSave(data, 'create')
      }
      toast.success(reminder?.id ? 'Reminder updated!' : 'Reminder created!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not save reminder.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-800 text-lg">
            {reminder?.id ? 'Edit Reminder' : 'New Reminder'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Title <span className="text-red-400">*</span></label>
            <input className="input" name="title" value={form.title} onChange={handle}
              placeholder="e.g. Annual vaccination" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" name="reminder_type" value={form.reminder_type} onChange={handle}>
                {REMINDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Pet (optional)</label>
              <select className="input" name="pet" value={form.pet} onChange={handle}>
                <option value="">No specific pet</option>
                {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due Date <span className="text-red-400">*</span></label>
            <input className="input" type="datetime-local" name="due_date"
              value={form.due_date} onChange={handle} required />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input h-20 resize-none" name="notes"
              placeholder="Additional details…" value={form.notes} onChange={handle} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {saving ? 'Saving…' : 'Save Reminder'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([])
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'new' | reminder object
  const [filter, setFilter] = useState('upcoming') // 'upcoming' | 'completed' | 'all'

  useEffect(() => {
    petsApi.listPets().then(r => setPets(r.data.results || r.data))
    fetchReminders()
  }, [])

  const fetchReminders = () => {
    setLoading(true)
    remindersApi.listReminders()
      .then(r => setReminders(r.data.results || r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleSave = (saved, action) => {
    if (action === 'create') {
      setReminders(rs => [saved, ...rs])
    } else {
      setReminders(rs => rs.map(r => r.id === saved.id ? saved : r))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this reminder?')) return
    await remindersApi.deleteReminder(id)
    setReminders(rs => rs.filter(r => r.id !== id))
    toast.success('Reminder deleted.')
  }

  const handleComplete = async (reminder) => {
    try {
      const { data } = await remindersApi.updateReminder(reminder.id, { is_completed: true })
      setReminders(rs => rs.map(r => r.id === data.id ? data : r))
      toast.success('Marked as complete!')
    } catch {
      toast.error('Could not update reminder.')
    }
  }

  const now = new Date()
  const filtered = reminders.filter(r => {
    if (filter === 'upcoming') return !r.is_completed
    if (filter === 'completed') return r.is_completed
    return true
  })

  const isOverdue = r => !r.is_completed && new Date(r.due_date) < now

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {modal !== null && (
        <ReminderModal
          reminder={modal === 'new' ? null : modal}
          pets={pets}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reminders</h1>
          <p className="text-slate-500 text-sm mt-1">Vaccination schedules, vet visits, and follow-ups.</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('new')}>
          <Plus size={16} /> New Reminder
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['upcoming', 'completed', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize
              ${filter === f ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400">No {filter} reminders.</p>
          <button className="btn-primary mt-4 text-sm" onClick={() => setModal('new')}>
            Create your first reminder
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id}
              className={`card flex items-start gap-4 transition ${r.is_completed ? 'opacity-60' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isOverdue(r) ? 'bg-red-50' : r.is_completed ? 'bg-green-50' : 'bg-teal-50'
              }`}>
                {r.is_completed
                  ? <CheckCircle size={18} className="text-green-600" />
                  : isOverdue(r)
                  ? <AlertTriangle size={18} className="text-red-500" />
                  : <Bell size={18} className="text-teal-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-semibold text-sm ${r.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {r.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={11} /> {new Date(r.due_date).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">· {r.reminder_type?.replace('_', ' ')}</span>
                      {r.pet_name && <span className="text-xs text-slate-400">· {r.pet_name}</span>}
                      {isOverdue(r) && (
                        <span className="text-xs text-red-500 font-medium">Overdue</span>
                      )}
                    </div>
                    {r.notes && <p className="text-xs text-slate-500 mt-1">{r.notes}</p>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!r.is_completed && (
                  <>
                    <button onClick={() => handleComplete(r)}
                      className="p-2 rounded-xl text-green-600 hover:bg-green-50 transition" title="Mark complete">
                      <CheckCircle size={16} />
                    </button>
                    <button onClick={() => setModal(r)}
                      className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition" title="Edit">
                      <Edit2 size={16} />
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(r.id)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
