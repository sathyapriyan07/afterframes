import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Film, Users, LayoutDashboard, Image, Music, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/movies', label: 'Movies', icon: Film },
  { to: '/admin/persons', label: 'Persons', icon: Users },
  { to: '/admin/sections', label: 'Sections', icon: Image },
  { to: '/admin/music', label: 'Music Links', icon: Music },
]

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  const Sidebar = () => (
    <aside className="flex flex-col h-full">
      <div className="p-5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Film size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">MediaHub</div>
            <div className="text-xs text-dark-400">Admin Panel</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              isActive(to, exact)
                ? 'bg-accent text-white font-medium'
                : 'text-dark-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={16} />
            {label}
            {isActive(to, exact) && <ChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => signOut().then(() => navigate('/'))}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-400 hover:bg-white/5 hover:text-white transition-all w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-56 flex-shrink-0 glass-dark border-r border-white/5 flex-col fixed h-full z-30">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 glass-dark border-r border-white/5 flex flex-col animate-slide-up">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="glass-dark border-b border-white/5 px-4 h-14 flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Menu size={18} className="text-white" />
          </button>
          <h1 className="text-sm font-medium text-white">
            {NAV.find(n => isActive(n.to, n.exact))?.label || 'Admin'}
          </h1>
          <Link to="/" className="ml-auto text-xs text-dark-400 hover:text-white transition-colors">
            ← View Site
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
