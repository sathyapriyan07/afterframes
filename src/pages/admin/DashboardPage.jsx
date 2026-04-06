import { useQuery } from '@tanstack/react-query'
import { Film, Users, Image, Music, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../layouts/AdminLayout'
import { supabase } from '../../lib/supabase'

async function fetchStats() {
  const [movies, persons, assets, music] = await Promise.all([
    supabase.from('movies').select('id', { count: 'exact', head: true }),
    supabase.from('persons').select('id', { count: 'exact', head: true }),
    supabase.from('movie_assets').select('id', { count: 'exact', head: true }),
    supabase.from('music_links').select('id', { count: 'exact', head: true }),
  ])
  return {
    movies: movies.count || 0,
    persons: persons.count || 0,
    assets: assets.count || 0,
    music: music.count || 0,
  }
}

const QUICK_ACTIONS = [
  { to: '/admin/movies/import', label: 'Import Movie', icon: Film, color: 'bg-blue-500/10 text-blue-400' },
  { to: '/admin/persons', label: 'Manage Persons', icon: Users, color: 'bg-purple-500/10 text-purple-400' },
  { to: '/admin/sections', label: 'Edit Sections', icon: Image, color: 'bg-green-500/10 text-green-400' },
  { to: '/admin/music', label: 'Music Links', icon: Music, color: 'bg-orange-500/10 text-orange-400' },
]

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
  })

  const STAT_CARDS = [
    { label: 'Movies', value: stats?.movies, icon: Film, color: 'text-blue-400' },
    { label: 'Persons', value: stats?.persons, icon: Users, color: 'text-purple-400' },
    { label: 'Assets', value: stats?.assets, icon: Image, color: 'text-green-400' },
    { label: 'Music Links', value: stats?.music, icon: Music, color: 'text-orange-400' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Dashboard</h2>
          <p className="text-dark-400 text-sm">Overview of your MediaHub content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-dark rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-dark-400 text-sm">{label}</span>
                <Icon size={16} className={color} />
              </div>
              {isLoading ? (
                <div className="shimmer h-8 w-16 rounded-lg" />
              ) : (
                <div className="text-2xl font-bold text-white">{value?.toLocaleString()}</div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-dark-400 mb-3 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="glass-dark rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-white/5 transition-all duration-200 card-hover"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-sm text-white text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
