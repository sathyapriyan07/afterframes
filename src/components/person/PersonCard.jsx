import { Link } from 'react-router-dom'
import { LazyImage } from '../ui/LazyImage'
import { tmdbImage } from '../../services/tmdb'

export function PersonCard({ person }) {
  const photo = person.profile_path ? tmdbImage(person.profile_path, 'w185') : null

  return (
    <Link to={`/person/${person.id}`} className="flex-shrink-0 w-28 md:w-36 group card-hover block text-center">
      <div className="relative aspect-square rounded-full overflow-hidden bg-dark-700 mx-auto">
        <LazyImage src={photo} alt={person.name} className="w-full h-full" />
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium text-white truncate group-hover:text-accent transition-colors">{person.name}</p>
        <p className="text-xs text-dark-400 mt-0.5 capitalize">{person.department?.toLowerCase()}</p>
      </div>
    </Link>
  )
}
