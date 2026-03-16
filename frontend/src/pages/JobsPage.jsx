import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useResumeStore from '../store/resumeStore'
import useJobStore    from '../store/jobStore'
import api from '../utils/api'
import { useTitle } from '../hooks'

export default function JobsPage() {
  const { resumes, fetchResumes } = useResumeStore()
  useTitle('Job Matching')
  const { savedJobs, jobResults, isSearching, fetchSavedJobs, findJobs, saveJob, updateJobStatus } = useJobStore()
  const [selectedResume, setSelectedResume] = useState('')
  const [location,  setLocation]  = useState('')
  const [jobType,   setJobType]   = useState('Full-time')
  const [activeTab, setActiveTab] = useState('discover')
  const results = jobResults

  useEffect(() => {
    fetchResumes()
    fetchSavedJobs()
  }, [])

  const loading = isSearching

  const findJobsHandler = async () => {
    if (!selectedResume) return toast.error('Please select a resume first')
    try {
      const { data: full } = await api.get(`/resumes/${selectedResume}`)
      await findJobs({ resumeContent: full.resume.content, location, jobType })
    } catch {
      toast.error('Failed to load resume')
    }
  }


  const handleSaveJob      = (job, matchScore) => saveJob(job, matchScore)
  const handleUpdateStatus = (id, status)      => updateJobStatus(id, status)

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title">Job Matching</h1>
        <p className="section-sub">AI analyses your resume and surfaces the best-fit roles.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded mb-6 w-fit">
        {['discover', 'saved'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded capitalize transition-all ${activeTab === t ? 'bg-white text-ink-700 shadow-sm' : 'text-ink-400 hover:text-ink-600'}`}>
            {t} {t === 'saved' && savedJobs.length > 0 && <span className="ml-1 badge-ink">{savedJobs.length}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'discover' && (
        <div>
          {/* Search form */}
          <div className="card mb-8">
            <h3 className="text-sm font-medium text-ink-700 mb-4">Find matching jobs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label">Resume</label>
                <select className="select" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                  <option value="">Select resume...</option>
                  {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Location preference</label>
                <input className="input" placeholder="Remote / Bangalore / Mumbai…" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div>
                <label className="label">Job type</label>
                <select className="select" value={jobType} onChange={e => setJobType(e.target.value)}>
                  {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button onClick={findJobsHandler} disabled={loading} className="btn-primary">
              {loading ? <><Spin /> Matching roles...</> : '✦ Find matching jobs'}
            </button>
          </div>

          {/* Results */}
          {loading && <JobsLoader />}

          {results && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InfoCard label="Career level" value={results.careerLevel?.replace(/\b\w/g, c => c.toUpperCase())} />
                <InfoCard label="Top skills" value={results.topSkills?.slice(0,2).join(', ')} />
                <InfoCard label="Industries" value={results.industryFit?.slice(0,2).join(', ')} />
                <InfoCard label="Roles found" value={results.recommendedRoles?.length} />
              </div>

              {/* Role cards */}
              <div>
                <h3 className="text-sm font-medium text-ink-700 mb-3">Recommended roles</h3>
                <div className="space-y-3">
                  {results.recommendedRoles?.map((role, i) => (
                    <JobCard key={i} role={role} onSave={() => handleSaveJob(role, role.matchScore)} />
                  ))}
                </div>
              </div>

              {/* Where to search */}
              {results.searchPlatforms?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-ink-700 mb-3">Where to search</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.searchPlatforms.map((p, i) => (
                      <a key={i} href={p.url} target="_blank" rel="noreferrer"
                        className="card-hover flex items-start gap-3 p-4 group">
                        <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-xs font-bold text-ink-600 group-hover:bg-ink-700 group-hover:text-gold-400 transition-all flex-shrink-0">
                          {p.platform[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-ink-700">{p.platform}</div>
                          <div className="text-xs text-ink-400">{p.tip}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {!results && !loading && (
            <div className="card text-center py-16">
              <div className="text-4xl text-ink-200 mb-4">◉</div>
              <h3 className="font-medium text-ink-700 mb-2">Discover your perfect roles</h3>
              <p className="text-sm text-ink-400">Select a resume above and our AI will match you with relevant job opportunities.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div>
          {savedJobs.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-4xl text-ink-200 mb-4">◉</div>
              <h3 className="font-medium text-ink-700 mb-2">No saved jobs yet</h3>
              <p className="text-sm text-ink-400">Discover and save jobs from the Discover tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedJobs.map(j => (
                <div key={j.id} className="card flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm text-ink-700">{j.job_data.title || j.job_data.role || 'Role'}</h3>
                      {j.match_score && <span className="badge-gold">{j.match_score}% match</span>}
                    </div>
                    <p className="text-xs text-ink-400">{j.job_data.description?.slice(0,100)}...</p>
                  </div>
                  <select
                    value={j.status}
                    onChange={e => handleUpdateStatus(j.id, e.target.value)}
                    className="select text-xs py-1.5 w-32 flex-shrink-0"
                  >
                    {['saved','applied','interviewing','offered','rejected'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function JobCard({ role, onSave }) {
  const [saved, setSaved] = useState(false)
  const demandColors = { high: 'badge-success', medium: 'badge-gold', low: 'badge-ink' }

  return (
    <div className="card-hover p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-medium text-ink-700 mb-1">{role.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={demandColors[role.demandLevel] || 'badge-ink'}>{role.demandLevel} demand</span>
            {role.salaryRange && <span className="text-xs text-ink-400">{role.salaryRange}</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-serif text-ink-800">{role.matchScore}%</div>
          <div className="text-2xs text-ink-400">match</div>
        </div>
      </div>

      <p className="text-xs text-ink-500 mb-3 leading-relaxed">{role.description}</p>

      {role.missingSkills?.length > 0 && (
        <div className="mb-3">
          <p className="text-2xs text-ink-400 mb-1.5 uppercase tracking-wide">Skills to develop</p>
          <div className="flex flex-wrap gap-1.5">
            {role.missingSkills.map(s => (
              <span key={s} className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 text-2xs rounded">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => { if (!saved) { onSave(); setSaved(true) } }}
          className={saved ? 'btn-ghost btn-sm' : 'btn-outline btn-sm'}
          disabled={saved}
        >
          {saved ? '✓ Saved' : '+ Save job'}
        </button>
        {role.searchKeywords?.[0] && (
          <a
            href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role.title)}`}
            target="_blank" rel="noreferrer"
            className="btn-ghost btn-sm"
          >
            Search LinkedIn →
          </a>
        )}
      </div>
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="card p-4">
      <div className="text-2xs text-ink-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm font-medium text-ink-700 capitalize">{value || '—'}</div>
    </div>
  )
}

function JobsLoader() {
  return (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="card animate-pulse p-5">
          <div className="flex justify-between mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-stone-200 rounded w-1/3" />
              <div className="h-3 bg-stone-100 rounded w-1/4" />
            </div>
            <div className="h-10 w-12 bg-stone-100 rounded" />
          </div>
          <div className="h-3 bg-stone-100 rounded w-full mb-2" />
          <div className="h-3 bg-stone-100 rounded w-4/5" />
        </div>
      ))}
    </div>
  )
}

function Spin() {
  return <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
}
