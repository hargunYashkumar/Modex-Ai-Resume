import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useResumeStore  from '../store/resumeStore'
import useCourseStore  from '../store/courseStore'
import api from '../utils/api'
import { useTitle } from '../hooks'

const PROVIDER_COLORS = {
  'Coursera': 'bg-blue-50 text-blue-700 border-blue-200',
  'Udemy': 'bg-purple-50 text-purple-700 border-purple-200',
  'LinkedIn Learning': 'bg-sky-50 text-sky-700 border-sky-200',
  'edX': 'bg-red-50 text-red-700 border-red-200',
  'freeCodeCamp': 'bg-green-50 text-green-700 border-green-200',
  'Google': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'AWS': 'bg-orange-50 text-orange-700 border-orange-200',
  'Microsoft': 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

export default function CoursesPage() {
  const { resumes, fetchResumes } = useResumeStore()
  useTitle('Learning Roadmap')
  const { recommendations, isLoading, getRecommendations } = useCourseStore()
  const [selectedResume, setSelectedResume] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [filter, setFilter] = useState('all')

  const data    = recommendations
  const loading = isLoading

  useEffect(() => { fetchResumes() }, [])

  const generate = async () => {
    if (!selectedResume) return toast.error('Please select a resume first')
    try {
      const { data: full } = await api.get(`/resumes/${selectedResume}`)
      await getRecommendations({
        resumeContent: full.resume.content,
        targetRole,
        resumeId: selectedResume,
      })
    } catch { toast.error('Failed to load resume') }
  }

  const priorityColors = { high: 'badge-danger', medium: 'badge-gold', low: 'badge-ink' }
  const importanceColors = { critical: 'text-danger', high: 'text-warning', medium: 'text-ink-500' }

  const filteredCourses = data?.courses?.filter(c =>
    filter === 'all' ? true :
    filter === 'free' ? c.cost === 'free' :
    filter === 'cert' ? c.certificateOffered :
    c.priority === filter
  ) || []

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title">Learning Roadmap</h1>
        <p className="section-sub">AI-curated courses to close your skill gaps and advance your career.</p>
      </div>

      {/* Input card */}
      <div className="card mb-8">
        <h3 className="text-sm font-medium text-ink-700 mb-4">Get personalised recommendations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Resume</label>
            <select className="select" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
              <option value="">Select resume...</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Target role (optional)</label>
            <input className="input" placeholder="Senior Full Stack Engineer…" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
          </div>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary">
          {loading ? <><Spin /> Analysing skill gaps...</> : '✦ Get course recommendations'}
        </button>
      </div>

      {loading && <CoursesLoader />}

      {data && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

          {/* Skill gaps */}
          {data.skillGaps?.length > 0 && (
            <div>
              <h2 className="text-base font-medium text-ink-700 mb-3">Skill gaps identified</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.skillGaps.map((gap, i) => (
                  <div key={i} className="card p-4 border-l-gold">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-sm text-ink-700">{gap.skill}</span>
                      <span className={`text-2xs font-semibold uppercase ${importanceColors[gap.importance]}`}>{gap.importance}</span>
                    </div>
                    <p className="text-xs text-ink-400 leading-relaxed">{gap.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning path timeline */}
          {data.learningPath && (
            <div>
              <h2 className="text-base font-medium text-ink-700 mb-4">Your learning path</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Short term (1–3 months)', items: data.learningPath.shortTerm, color: 'border-gold-400' },
                  { label: 'Medium term (3–6 months)', items: data.learningPath.mediumTerm, color: 'border-ink-400' },
                  { label: 'Long term (6–12 months)', items: data.learningPath.longTerm, color: 'border-stone-400' },
                ].map(phase => (
                  <div key={phase.label} className={`card border-t-4 ${phase.color} p-4`}>
                    <h3 className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-3">{phase.label}</h3>
                    <ul className="space-y-2">
                      {phase.items?.map((item, i) => (
                        <li key={i} className="text-xs text-ink-600 flex gap-2">
                          <span className="text-gold-500 mt-0.5 flex-shrink-0">→</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {data.estimatedTimeInvestment && (
                <p className="text-sm text-ink-500 mt-3 flex items-center gap-2">
                  <span className="text-gold-500">◎</span>
                  Estimated total investment: <strong className="text-ink-700">{data.estimatedTimeInvestment}</strong>
                </p>
              )}
            </div>
          )}

          {/* Course list with filters */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-medium text-ink-700">
                Recommended courses
                <span className="ml-2 text-sm font-normal text-ink-400">({filteredCourses.length})</span>
              </h2>
              <div className="flex gap-1 bg-stone-100 p-1 rounded overflow-x-auto">
                {['all','free','cert','high'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-all capitalize ${filter === f ? 'bg-white text-ink-700 shadow-sm' : 'text-ink-400 hover:text-ink-600'}`}>
                    {f === 'cert' ? 'With certificate' : f === 'high' ? 'High priority' : f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course, i) => (
                <CourseCard key={i} course={course} priorityColors={priorityColors} />
              ))}
            </div>
          </div>

          {/* Certifications */}
          {data.certifications?.length > 0 && (
            <div>
              <h2 className="text-base font-medium text-ink-700 mb-3">Industry certifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.certifications.map((cert, i) => (
                  <div key={i} className="card p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-gold-100 flex items-center justify-center text-gold-600 flex-shrink-0">🏆</div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-ink-700 truncate">{cert.name}</h3>
                      <p className="text-xs text-ink-400">{cert.provider} · {cert.timeToComplete}</p>
                      <p className="text-xs text-ink-500 mt-1">{cert.relevance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!data && !loading && (
        <div className="card text-center py-16">
          <div className="text-4xl text-ink-200 mb-4">◐</div>
          <h3 className="font-medium text-ink-700 mb-2">Discover your learning roadmap</h3>
          <p className="text-sm text-ink-400 max-w-sm mx-auto">Select a resume and our AI will identify skill gaps and recommend the best courses for your goals.</p>
        </div>
      )}
    </div>
  )
}

function CourseCard({ course, priorityColors }) {
  const providerStyle = PROVIDER_COLORS[course.provider] || 'bg-stone-50 text-stone-700 border-stone-200'
  return (
    <div className="card-hover p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-ink-700 leading-snug mb-1">{course.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-2xs px-2 py-0.5 rounded border ${providerStyle}`}>{course.provider}</span>
            <span className={priorityColors[course.priority] || 'badge-ink'}>{course.priority}</span>
            {course.cost === 'free' && <span className="badge-success">Free</span>}
            {course.certificateOffered && <span className="badge-ink">Certificate</span>}
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-400 mb-3 leading-relaxed">{course.reason}</p>

      <div className="flex items-center justify-between text-xs text-ink-400 mb-3">
        <span>⏱ {course.duration}</span>
        <span className="capitalize">{course.level}</span>
      </div>

      {course.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {course.skills.slice(0,4).map(s => (
            <span key={s} className="px-2 py-0.5 bg-stone-50 border border-stone-200 text-stone-600 text-2xs rounded">{s}</span>
          ))}
        </div>
      )}

      {course.url ? (
        <a href={course.url} target="_blank" rel="noreferrer" className="btn-outline btn-sm w-full text-center block">
          View course →
        </a>
      ) : (
        <button className="btn-ghost btn-sm w-full">Search for this course</button>
      )}
    </div>
  )
}

function CoursesLoader() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="card animate-pulse p-4 h-24" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="card animate-pulse p-5 h-40" />)}
      </div>
    </div>
  )
}

function Spin() {
  return <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
}
