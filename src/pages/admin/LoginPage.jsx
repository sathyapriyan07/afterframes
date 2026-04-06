import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Verify the signed-in user is an admin
    const { data } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (!data) {
      // Not an admin — sign them back out immediately
      await signOut()
      setError('Access denied. This email is not authorized as an admin.')
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(10,132,255,0.08) 0%, #0a0a0b 60%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #0a84ff, #0055cc)', boxShadow: '0 8px 32px rgba(10,132,255,0.4)' }}>
            <Film size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-dark-400 text-sm mt-1.5">Sign in to manage MediaHub</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div>
            <label className="text-xs text-dark-400 font-medium mb-1.5 block tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-dark-400 font-medium mb-1.5 block tracking-wide">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-2.5 text-red-400 text-sm" style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? 'rgba(10,132,255,0.5)'
                : 'linear-gradient(135deg, #0a84ff 0%, #0066cc 100%)',
              boxShadow: loading ? 'none' : '0 4px 24px rgba(10,132,255,0.35)',
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
