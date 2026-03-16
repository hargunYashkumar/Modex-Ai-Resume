import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { useToast } from '../../hooks'

export default function AiToolbar({ resume, onUpdate }) {
  const [activeTab, setActiveTab] = useState('ats')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const TABS = [
    { id: 'ats',     label: 'ATS Score' },
    { id: 'bullet',  label: 'Improve Bullet' },
    { id: 'summary', label: 'AI Summary' },
    { id: 'tailor',  label: 'Tailor for Job' },
  ]

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gold-500 text-lg">✦</span>
        <h3 className="text-sm font-medium text-ink-700">AI Tools</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id} onClick={() => { setActiveTab(t.id); setResult(null) }}
            className={`px-2.5 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-all ${
              activeTab === t.id ? 'bg-white text-ink-700 shadow-sm' : 'text-ink-400 hover:text-ink-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'ats'     && <AtsTab resume={resume} loading={loading} setLoading={setLoading} result={result} setResult={setResult} />}
      {activeTab === 'bullet'  && <BulletTab loading={loading} setLoading={setLoading} result={result} setResult={setResult} resume={resume} />}
      {activeTab === 'summary' && <SummaryTab resume={resume} loading={loading} setLoading={setLoading} result={result} setResult={setResult} onUpdate={onUpdate} />}
      {activeTab === 'tailor'  && <TailorTab resume={resume} loading={loading} setLoading={setLoading} result={result} setResult={setResult} onUpdate={onUpdate} />}
    </div>
  )
}

function AtsTab({ resume, loading, setLoading, result, setResult }) {
  const [jobDesc, setJobDesc] = useState('')

  const run = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/ai/ats-score', {
        resumeId: resume.id,
        resumeContent: resume.content,
        jobDescription: jobDesc,
      })
      setResult(data.analysis)
    } catch { toast.error('ATS analysis failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Job description (optional)</label>
        <textarea className="textarea text-xs min-h-20" rows={3} placeholder="Paste job description for targeted analysis..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
      </div>
      <button onClick={run} disabled={loading} className="btn-primary btn-sm w-full">
        {loading ? <><Spin /> Analysing...</> : '✦ Analyse resume'}
      </button>

      {result && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-4">
          {/* Score ring */}
          <div className="text-center py-4 border border-stone-200 rounded-lg">
            <div className="text-5xl font-serif text-ink-800">{result.overallScore}</div>
            <div className="text-xs text-ink-400 uppercase tracking-wide mt-1">ATS Score</div>
            <div className="mt-3 h-2 bg-stone-200 rounded-full overflow-hidden mx-6">
              <div className="h-full bg-gold-400 rounded-full transition-all" style={{ width: `${result.overallScore}%` }} />
            </div>
          </div>

          {/* Section scores */}
          {Object.entries(result.sections || {}).map(([key, sec]) => (
            <div key={key} className="border-l-gold pl-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-ink-600 capitalize">{key}</span>
                <span className="text-ink-400">{sec.score}/100</span>
              </div>
              <p className="text-xs text-ink-400 leading-relaxed">{sec.feedback}</p>
            </div>
          ))}

          {/* Top suggestions */}
          {result.topSuggestions?.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-ink-600 mb-2">Top suggestions</h4>
              <ul className="space-y-1.5">
                {result.topSuggestions.map((s, i) => (
                  <li key={i} className="text-xs text-ink-500 flex gap-2">
                    <span className="text-gold-500 mt-0.5">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

function BulletTab({ loading, setLoading, result, setResult, resume }) {
  const [bullet, setBullet] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  const run = async () => {
    if (!bullet.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/ai/improve-bullet', { bullet, jobTitle })
      setResult(data)
    } catch { toast.error('Failed to improve bullet') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Current bullet point</label>
        <textarea className="textarea text-xs min-h-16" rows={3} placeholder="Worked on backend services..." value={bullet} onChange={e => setBullet(e.target.value)} />
      </div>
      <div>
        <label className="label">Your job title (optional)</label>
        <input className="input text-sm" placeholder="Senior Backend Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
      </div>
      <button onClick={run} disabled={loading || !bullet.trim()} className="btn-primary btn-sm w-full">
        {loading ? <><Spin /> Improving...</> : '✦ Improve bullet'}
      </button>

      {result && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-xs font-medium text-green-800 mb-1">Improved</p>
            <p className="text-sm text-green-900">{result.improved}</p>
          </div>
          {result.alternatives?.map((alt, i) => (
            <div key={i} className="bg-stone-50 border border-stone-200 rounded p-3">
              <p className="text-xs text-ink-400 mb-1">Alternative {i+1}</p>
              <p className="text-sm text-ink-700">{alt}</p>
            </div>
          ))}
          {result.tips && <p className="text-xs text-ink-400 italic border-l-gold pl-3">{result.tips}</p>}
        </motion.div>
      )}
    </div>
  )
}

function SummaryTab({ resume, loading, setLoading, result, setResult, onUpdate }) {
  const [targetRole, setTargetRole] = useState('')
  const { ai: aiToast } = useToast()

  const run = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/ai/generate-summary', { resumeContent: resume.content, targetRole })
      setResult(data)
    } catch { toast.error('Failed to generate summary') }
    finally { setLoading(false) }
  }

  const apply = () => {
    if (!result?.summary) return
    onUpdate({ ...resume.content, personalInfo: { ...resume.content.personalInfo, summary: result.summary } })
    aiToast('Summary applied!')
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Target role (optional)</label>
        <input className="input text-sm" placeholder="Senior Product Manager" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
      </div>
      <button onClick={run} disabled={loading} className="btn-primary btn-sm w-full">
        {loading ? <><Spin /> Generating...</> : '✦ Generate summary'}
      </button>

      {result && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-3">
          <div className="bg-stone-50 border border-stone-200 rounded p-4">
            <p className="text-sm text-ink-700 leading-relaxed">{result.summary}</p>
          </div>
          {result.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.keywords.map(k => <span key={k} className="badge-gold">{k}</span>)}
            </div>
          )}
          <button onClick={apply} className="btn-gold btn-sm w-full">Apply to resume</button>
        </motion.div>
      )}
    </div>
  )
}

function TailorTab({ resume, loading, setLoading, result, setResult, onUpdate }) {
  const [jobDesc, setJobDesc] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const { ai: aiToast } = useToast()

  const run = async () => {
    if (!jobDesc.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/ai/tailor-resume', { resumeContent: resume.content, jobDescription: jobDesc, jobTitle, company })
      setResult(data)
    } catch { toast.error('Failed to tailor resume') }
    finally { setLoading(false) }
  }

  const apply = () => {
    if (!result?.tailoredContent) return
    onUpdate(result.tailoredContent)
    aiToast('Resume tailored for this role!')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Job title</label>
          <input className="input text-sm" placeholder="Software Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Company</label>
          <input className="input text-sm" placeholder="Google" value={company} onChange={e => setCompany(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Job description *</label>
        <textarea className="textarea text-xs min-h-28" rows={5} placeholder="Paste the full job description..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
      </div>
      <button onClick={run} disabled={loading || !jobDesc.trim()} className="btn-primary btn-sm w-full">
        {loading ? <><Spin /> Tailoring...</> : '✦ Tailor for this job'}
      </button>

      {result && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-3">
          <div className="text-center py-3 bg-stone-50 rounded border border-stone-200">
            <div className="text-3xl font-serif text-ink-800">{result.matchScore}%</div>
            <div className="text-xs text-ink-400">match score</div>
          </div>
          {result.changes?.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-ink-600 mb-2">Changes made</h4>
              <ul className="space-y-1">
                {result.changes.map((c, i) => <li key={i} className="text-xs text-ink-500 flex gap-2"><span className="text-green-600">✓</span>{c}</li>)}
              </ul>
            </div>
          )}
          <button onClick={apply} className="btn-gold btn-sm w-full">Apply tailored content</button>
        </motion.div>
      )}
    </div>
  )
}

function Spin() {
  return <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/></svg>
}
