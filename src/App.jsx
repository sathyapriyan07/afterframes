import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'))
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const AdminLoginPage = lazy(() => import('./pages/admin/LoginPage'))
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'))
const AdminMoviesPage = lazy(() => import('./pages/admin/MoviesPage'))
const AdminMovieDetailPage = lazy(() => import('./pages/admin/MovieDetailPage'))
const AdminPersonsPage = lazy(() => import('./pages/admin/PersonsPage'))
const AdminSectionsPage = lazy(() => import('./pages/admin/SectionsPage'))
const AdminMusicPage = lazy(() => import('./pages/admin/MusicPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/movie/:id" element={<MovieDetailPage />} />
                <Route path="/person/:id" element={<PersonDetailPage />} />
                <Route path="/search" element={<SearchPage />} />

                {/* Admin Auth */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Admin Protected */}
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/movies" element={<ProtectedRoute><AdminMoviesPage /></ProtectedRoute>} />
                <Route path="/admin/movies/import" element={<ProtectedRoute><AdminMoviesPage /></ProtectedRoute>} />
                <Route path="/admin/movies/:id" element={<ProtectedRoute><AdminMovieDetailPage /></ProtectedRoute>} />
                <Route path="/admin/persons" element={<ProtectedRoute><AdminPersonsPage /></ProtectedRoute>} />
                <Route path="/admin/sections" element={<ProtectedRoute><AdminSectionsPage /></ProtectedRoute>} />
                <Route path="/admin/music" element={<ProtectedRoute><AdminMusicPage /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>

            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1c1c1e',
                  color: '#f8f8f8',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#0a84ff', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ff453a', secondary: '#fff' } },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
