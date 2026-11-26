import { Menu, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar({ onMenuClick }) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 md:px-6 gap-4 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <Link
        to="/reminders"
        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
        aria-label="Reminders"
      >
        <Bell size={20} />
      </Link>
    </header>
  )
}
