import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTitle } from '../hooks'

export default function NotFoundPage() {
  useTitle('Page not found')
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-serif text-ink-200 mb-4 select-none">404</div>
        <h1 className="text-2xl font-serif text-ink-800 mb-2">Page not found</h1>
        <p className="text-sm text-ink-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-outline">
            Go back
          </button>
          <Link to="/dashboard" className="btn-primary">
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
