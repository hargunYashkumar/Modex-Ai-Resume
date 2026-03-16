import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore   from '../store/authStore'
import useResumeStore from '../store/resumeStore'
import useJobStore    from '../store/jobStore'
import AtsScoreGauge  from '../components/ui/AtsScoreGauge'
import { relativeDate } from '../utils/format'
import api from '../utils/api'
import { useTitle } from '../hooks'

const stagger = { container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }, item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22,1,0.36,1] } } } }

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const { resumes, fetchResumes, isLoading } = useResumeStore()
  const { savedJobs, fetchSavedJobs } = useJobStore()
  const [stats, setStats] = useState({ savedJobs: 0 })
  const navigate = useNavigate()
  useTitle('Dashboard')

  useEffect(() => {
    fetchResumes()
    fetchSavedJobs()
    api.get('/users/dashboard').then(r => setStats(r.data.stats || {})).catch(() => {})
  }, [])

  const bestResume  = resumes.find(r => r.ats_score) || resumes[0]
  const bestScore   = bestResume?.ats_score || null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }} className="mb-10">
        <h1 className="text-3xl font-serif text-ink-800 mb-1">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-ink-400">Here's what's happening with your career toolkit.</p>
      </motion.div>

      {/* Stats cards */}
      <motion.div variants={stagger.container} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
      >
        <StatCard value={resumes.length}       label="Resumes"       icon="◈" link="/resumes" delay={0} />
        <StatCard value={savedJobs.length}     label="Saved jobs"    icon="◉" link="/jobs"    delay={0.07} />
        <StatCard value={bestScore ? `${bestScore}%` : '—'} label="Best ATS score" icon="◎" link="/resumes" delay={0.14} />
      </motion.div>

      {/* ATS Gauge — best performing resume */}
      {bestResume && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45 }}
          className="card mb-10 flex items-center gap-6 p-5"
        >
          <AtsScoreGauge score={bestScore} size={88} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Best performing resume</p>
            <p className="font-medium text-ink-700 truncate mb-0.5">{bestResume.title}</p>
            <p className="text-xs text-ink-400">
              {bestScore
                ? `Updated ${relativeDate(bestResume.updated_at)}`
                : 'Run ATS analysis in the builder to see your score'}
            </p>
            <Link
              to={`/resumes/${bestResume.id}/edit`}
              className="inline-block mt-2 text-xs font-medium text-ink-600 hover:text-ink-800 transition-colors underline-gold"
            >
              {bestScore ? 'Improve score →' : 'Open builder →'}
            </Link>
          </div>
          {bestScore && (
            <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
              {bestScore >= 80
                ? <span className="badge badge-success">ATS ready</span>
                : bestScore >= 60
                ? <span className="badge badge-gold">Needs polish</span>
                : <span className="badge badge-danger">Needs work</span>
              }
              <span className="text-xs text-ink-400">vs 85% industry avg</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.45 }} className="mb-10">
        <h2 className="text-base font-medium text-ink-600 mb-4 uppercase tracking-wide text-xs">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'New resume', sub: 'Start from scratch', icon: '✦', to: '/resumes/new', primary: true },
            { label: 'Upload resume', sub: 'Parse existing CV', icon: '↑', to: '/resumes?upload=1' },
            { label: 'Find jobs', sub: 'AI-matched roles', icon: '◉', to: '/jobs' },
            { label: 'Learn skills', sub: 'Course roadmap', icon: '◐', to: '/courses' },
          ].map(a => (
            <Link key={a.label} to={a.to}
              className={`card-hover p-4 flex flex-col gap-2 group transition-all ${a.primary ? 'bg-ink-700 border-ink-600 hover:bg-ink-600' : ''}`}
            >
              <span className={`text-xl ${a.primary ? 'text-gold-400' : 'text-ink-400 group-hover:text-gold-500'} transition-colors`}>{a.icon}</span>
              <div>
                <p className={`text-sm font-medium ${a.primary ? 'text-stone-50' : 'text-ink-700'}`}>{a.label}</p>
                <p className={`text-xs ${a.primary ? 'text-ink-300' : 'text-ink-400'}`}>{a.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent resumes */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-ink-700">Recent resumes</h2>
          <Link to="/resumes" className="text-xs text-ink-400 hover:text-ink-700 transition-colors">View all →</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.slice(0, 6).map(r => <ResumeCard key={r.id} resume={r} navigate={navigate} />)}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function StatCard({ value, label, icon, link, delay }) {
  return (
    <motion.div variants={stagger.item}>
      <Link to={link} className="card-hover flex items-center gap-4 p-5 group">
        <div className="w-11 h-11 rounded border-2 border-ink-100 flex items-center justify-center text-lg text-ink-400 group-hover:border-gold-400 group-hover:text-gold-500 transition-all flex-shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-serif text-ink-800">{value}</div>
          <div className="text-xs text-ink-400 uppercase tracking-wide">{label}</div>
        </div>
      </Link>
    </motion.div>
  )
}

function ResumeCard({ resume, navigate }) {
  const statusColors = { draft: 'badge-ink', published: 'badge-success', archived: 'badge-danger' }
  return (
    <div
      onClick={() => navigate(`/resumes/${resume.id}/edit`)}
      className="card-hover cursor-pointer p-5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded bg-ink-100 flex items-center justify-center text-ink-400 group-hover:bg-ink-700 group-hover:text-gold-400 transition-all">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <span className={statusColors[resume.status] || 'badge-ink'}>{resume.status}</span>
      </div>
      <h3 className="font-medium text-ink-700 text-sm mb-1 truncate">{resume.title}</h3>
      <p className="text-xs text-ink-400 mb-3">
        Edited {new Date(resume.updated_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
      </p>
      {resume.ats_score && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-gold-400 rounded-full transition-all" style={{ width: `${resume.ats_score}%` }} />
          </div>
          <span className="text-2xs text-ink-400 font-medium">ATS {resume.ats_score}%</span>
        </div>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="w-9 h-9 bg-stone-200 rounded mb-3" />
      <div className="h-3 bg-stone-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-stone-100 rounded w-1/2" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card text-center py-14">
      <div className="text-4xl text-ink-200 mb-4">◈</div>
      <h3 className="font-medium text-ink-700 mb-1">No resumes yet</h3>
      <p className="text-sm text-ink-400 mb-6">Create your first resume or upload an existing one.</p>
      <Link to="/resumes/new" className="btn-primary btn-sm">Build your first resume</Link>
    </div>
  )
}
