import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Film, Menu, X, Settings, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SearchBar } from '../components/ui/SearchBar'

export function MainLayout({ children }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileMenu(false)
    setSearchOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'glass-dark shadow-lg' : 'bg-gradient-to-b from-black/60 to-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Film size={15} className="text-white" />
            </div>
            <span className="font-semibold text-white hidden sm:block">MediaHub</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Search size={18} className="text-white" />
            </button>

            {isAdmin ? (
              /* Admin is logged in */
              <>
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass hover:bg-white/10 transition-colors text-sm text-white"
                >
                  <Settings size={14} />
                  Admin
                </Link>
                <button
                  onClick={() => signOut().then(() => navigate('/'))}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors text-sm text-dark-300 hover:text-white"
                  title="Sign out"
                >
                  <LogOut size={14} />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </>
            ) : (
              /* Not logged in — show Login button */
              <Link
                to="/admin/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 text-sm font-medium text-white active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #0a84ff 0%, #0066cc 100%)',
                  boxShadow: '0 2px 12px rgba(10,132,255,0.3)',
                }}
              >
                <LogIn size={14} />
                Login
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="sm:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              {mobileMenu ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3 animate-fade-in">
            <SearchBar autoFocus />
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="sm:hidden glass-dark border-t border-white/5 px-4 py-3 space-y-1 animate-fade-in">
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm text-white"
                >
                  <Settings size={15} /> Admin Panel
                </Link>
                <button
                  onClick={() => signOut().then(() => navigate('/'))}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm text-dark-300 w-full"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #0a84ff 0%, #0066cc 100%)' }}
              >
                <LogIn size={15} /> Login
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <Film size={12} className="text-white" />
            </div>
            <span className="text-sm text-dark-400">MediaHub</span>
          </div>
          <p className="text-xs text-dark-500">Movie & Person Media Hub. All media rights belong to respective owners.</p>
          {!isAdmin && (
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-xs text-dark-500 hover:text-accent transition-colors"
            >
              <LogIn size={12} /> Admin Login
            </Link>
          )}
        </div>
      </footer>
    </div>
  )
}
