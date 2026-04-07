import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const ADMIN_KEY = 'mediahub_is_admin'
const getCachedAdmin = () => localStorage.getItem(ADMIN_KEY) === 'true'
const setCachedAdmin = (val) => localStorage.setItem(ADMIN_KEY, val ? 'true' : 'false')
const clearCachedAdmin = () => localStorage.removeItem(ADMIN_KEY)

async function checkAdmin(user) {
  if (!user?.email) return false
  try {
    // Use rpc or direct query — works because the user is authenticated at this point
    const { data, error } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', user.email)
      .maybeSingle()
    if (error) {
      // Fallback: if RLS blocks the read, trust the cached value
      console.warn('admin check error:', error.message)
      return getCachedAdmin()
    }
    return !!data
  } catch {
    return getCachedAdmin()
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(getCachedAdmin)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      const u = session?.user ?? null
      setUser(u)

      if (u) {
        const admin = await checkAdmin(u)
        if (mounted) {
          setIsAdmin(admin)
          setCachedAdmin(admin)
        }
      } else {
        setIsAdmin(false)
        clearCachedAdmin()
      }

      if (mounted) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      const u = session?.user ?? null
      setUser(u)

      if (event === 'SIGNED_OUT' || !u) {
        setIsAdmin(false)
        clearCachedAdmin()
        setLoading(false)
      } else if (event === 'SIGNED_IN') {
        const admin = await checkAdmin(u)
        if (mounted) {
          setIsAdmin(admin)
          setCachedAdmin(admin)
          setLoading(false)
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Session refreshed silently — no loading change needed
        const admin = await checkAdmin(u)
        if (mounted) {
          setIsAdmin(admin)
          setCachedAdmin(admin)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password })
    return result
  }

  const signOut = async () => {
    clearCachedAdmin()
    setIsAdmin(false)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
