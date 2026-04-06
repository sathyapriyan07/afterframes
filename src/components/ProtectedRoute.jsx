import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in → go to login
  if (!user) return <Navigate to="/admin/login" replace />

  // Logged in but not an admin → go home
  if (!isAdmin) return <Navigate to="/" replace />

  return children
}
