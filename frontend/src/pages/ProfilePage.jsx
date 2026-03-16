import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import api from '../utils/api'
import { useTitle } from '../hooks'

export default function ProfilePage() {
  useTitle('Profile')
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    name: '', phone: '', location: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '', summary: '',
  })
  const [skills, setSkills]     = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading]   = useState(false)
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    api.get('/users/profile').then(({ data }) => {
      const p = data.profile
      setForm({
        name:         p.name         || '',
        phone:        p.phone        || '',
        location:     p.location     || '',
        linkedinUrl:  p.linkedin_url || '',
        githubUrl:    p.github_url   || '',
        portfolioUrl: p.portfolio_url || '',
        summary:      p.summary      || '',
      })
      setSkills(Array.isArray(p.skills) ? p.skills : [])
    }).catch(() => {})
  }, [])

  const f = (k, v) => setForm(s => ({ ...s, [k]: v }))

  const addSkill = () => {
    const s = skillInput.trim()
    if (!s || skills.includes(s)) return
    setSkills(prev => [...prev, s])
    setSkillInput('')
  }

  const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill))

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/users/profile', { ...form, skills })
      updateUser({ name: form.name })
      toast.success('Profile saved!')
    } catch { toast.error('Failed to save profile') }
    finally { setLoading(false) }
  }

  const TABS = [
    { id: 'personal', label: 'Personal details' },
    { id: 'skills',   label: 'Skills' },
    { id: 'links',    label: 'Links' },
  ]

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title">Profile</h1>
        <p className="section-sub">Your details pre-fill new resumes automatically.</p>
      </div>

      {/* Avatar card */}
      <div className="card mb-6 flex items-center gap-5 p-5">
        <div className="w-16 h-16 rounded-full bg-ink-700 flex items-center justify-center text-2xl font-semibold text-gold-400 flex-shrink-0 select-none">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-ink-700 truncate">{user?.name}</div>
          <div className="text-sm text-ink-400 truncate">{user?.email}</div>
          <div className="mt-2">
            <span className={`badge ${user?.subscription_tier === 'pro' ? 'badge-gold' : 'badge-ink'}`}>
              {user?.subscription_tier === 'pro' ? '✦ Pro' : 'Free plan'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded mb-5 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded transition-all ${
              activeTab === tab.id
                ? 'bg-white text-ink-700 shadow-sm'
                : 'text-ink-400 hover:text-ink-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={save}>

        {/* Personal details tab */}
        {activeTab === 'personal' && (
          <div className="card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full name</label>
                <input className="input" value={form.name}
                  onChange={e => f('name', e.target.value)} placeholder="Arjun Mehta" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone}
                  onChange={e => f('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" value={form.location}
                  onChange={e => f('location', e.target.value)} placeholder="Bangalore, India" />
              </div>
            </div>
            <div>
              <label className="label">Professional summary</label>
              <textarea
                className="textarea" rows={5}
                value={form.summary}
                onChange={e => f('summary', e.target.value)}
                placeholder="Experienced software engineer with 4+ years..."
              />
              <p className="text-xs text-ink-400 mt-1">{form.summary.length}/500 characters</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        )}

        {/* Skills tab */}
        {activeTab === 'skills' && (
          <div className="card space-y-4">
            <p className="text-sm text-ink-400">Add your core skills — these will pre-fill the skills section of new resumes.</p>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="React, Node.js, Python…"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              />
              <button type="button" onClick={addSkill} className="btn-primary btn-sm px-4">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-12">
              {skills.length === 0 && (
                <p className="text-sm text-ink-300 italic">No skills added yet</p>
              )}
              {skills.map(skill => (
                <span key={skill}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-ink-100 text-ink-700 text-sm rounded font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-ink-400 hover:text-danger transition-colors ml-1 text-base leading-none"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : 'Save skills'}
            </button>
          </div>
        )}

        {/* Links tab */}
        {activeTab === 'links' && (
          <div className="card space-y-4">
            <div>
              <label className="label">LinkedIn URL</label>
              <input className="input" value={form.linkedinUrl}
                onChange={e => f('linkedinUrl', e.target.value)}
                placeholder="linkedin.com/in/yourname" />
            </div>
            <div>
              <label className="label">GitHub URL</label>
              <input className="input" value={form.githubUrl}
                onChange={e => f('githubUrl', e.target.value)}
                placeholder="github.com/yourname" />
            </div>
            <div>
              <label className="label">Portfolio / website</label>
              <input className="input" value={form.portfolioUrl}
                onChange={e => f('portfolioUrl', e.target.value)}
                placeholder="yoursite.com" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : 'Save links'}
            </button>
          </div>
        )}

      </form>
    </div>
  )
}
