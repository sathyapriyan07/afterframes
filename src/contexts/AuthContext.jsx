import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const ADMIN_KEY = 'mediahub_is_admin'

const getCachedAdmin = () => localStorage.getItem(ADMIN_KEY) === 'true'
const setCachedAdmin = (val) => localStorage.setItem(ADMIN_KEY, val ? 'true' : 'false')
const clearCachedAdmin = () => localStorage.removeItem(ADMIN_KEY)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Initialise from cache so there's zero flash on refresh
  const [isAdmin, setIsAdmin] = useState(getCachedAdmin)
  const [loading, setLoading] = useState(true)

  const checkAdmin = async (currentUser) => {
    if (!currentUser) {
      setIsAdmin(false)
      clearCachedAdmin()
      return
    }
    const { data } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', currentUser.email)
      .maybeSingle()
    const admin = !!data
    setIsAdmin(admin)
    setCachedAdmin(admin)
  }

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) {
        // No session — clear everything immediately
        setIsAdmin(false)
        clearCachedAdmin()
        setLoading(false)
      } else {
        // Session exists — verify admin in background
        await checkAdmin(u)
        setLoading(false)
      }
    })

    // Keep in sync across tabs / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (event === 'SIGNED_OUT' || !u) {
        setIsAdmin(false)
        clearCachedAdmin()
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkAdmin(u)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = async () => {
    clearCachedAdmin()
    setIsAdmin(false)
    return supabase.auth.signOut()
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
