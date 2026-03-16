import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResumeEditor({ content, onChange }) {
  const [openSection, setOpenSection] = useState('personalInfo')

  const update = (section, value) => onChange({ ...content, [section]: value })

  const SECTIONS = [
    { id: 'personalInfo',    label: 'Personal Info', icon: '👤' },
    { id: 'summary',         label: 'Summary',       icon: '📝' },
    { id: 'workExperience',  label: 'Experience',    icon: '💼' },
    { id: 'education',       label: 'Education',     icon: '🎓' },
    { id: 'skills',          label: 'Skills',        icon: '⚡' },
    { id: 'projects',        label: 'Projects',      icon: '🛠' },
    { id: 'certifications',  label: 'Certifications',icon: '🏆' },
  ]

  return (
    <div className="p-4 space-y-1">
      {SECTIONS.map(sec => (
        <AccordionSection
          key={sec.id} icon={sec.icon} label={sec.label}
          isOpen={openSection === sec.id}
          onToggle={() => setOpenSection(openSection === sec.id ? null : sec.id)}
        >
          {sec.id === 'personalInfo'   && <PersonalInfoForm    data={content.personalInfo || {}}    onChange={v => update('personalInfo', v)} />}
          {sec.id === 'summary'        && <SummaryForm         data={content.personalInfo?.summary || ''}    onChange={v => update('personalInfo', { ...content.personalInfo, summary: v })} />}
          {sec.id === 'workExperience' && <WorkExpForm         items={content.workExperience || []} onChange={v => update('workExperience', v)} />}
          {sec.id === 'education'      && <EducationForm       items={content.education || []}      onChange={v => update('education', v)} />}
          {sec.id === 'skills'         && <SkillsForm          items={content.skills || []}         onChange={v => update('skills', v)} />}
          {sec.id === 'projects'       && <ProjectsForm        items={content.projects || []}       onChange={v => update('projects', v)} />}
          {sec.id === 'certifications' && <CertificationsForm  items={content.certifications || []} onChange={v => update('certifications', v)} />}
        </AccordionSection>
      ))}
    </div>
  )
}

function AccordionSection({ icon, label, isOpen, onToggle, children }) {
  return (
    <div className="border border-stone-200 rounded overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-50 transition-colors"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
          <span className="text-base leading-none">{icon}</span>
          {label}
        </span>
        <svg
          className={`w-4 h-4 text-ink-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-stone-100">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Personal Info ──────────────────────────────────────────────────────────
function PersonalInfoForm({ data, onChange }) {
  const f = (key, val) => onChange({ ...data, [key]: val })
  return (
    <div className="space-y-3">
      <Field label="Full name"   value={data.name || ''}      onChange={v => f('name', v)} placeholder="Arjun Mehta" />
      <Field label="Email"       value={data.email || ''}     onChange={v => f('email', v)} placeholder="arjun@email.com" type="email" />
      <Field label="Phone"       value={data.phone || ''}     onChange={v => f('phone', v)} placeholder="+91 98765 43210" />
      <Field label="Location"    value={data.location || ''}  onChange={v => f('location', v)} placeholder="Bangalore, India" />
      <Field label="LinkedIn URL" value={data.linkedinUrl || ''} onChange={v => f('linkedinUrl', v)} placeholder="linkedin.com/in/username" />
      <Field label="GitHub URL"  value={data.githubUrl || ''} onChange={v => f('githubUrl', v)} placeholder="github.com/username" />
    </div>
  )
}

// ── Summary ────────────────────────────────────────────────────────────────
function SummaryForm({ data, onChange }) {
  return (
    <div>
      <label className="label">Professional summary</label>
      <textarea
        className="textarea"
        rows={4}
        placeholder="Experienced software engineer with 5+ years..."
        value={data || ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

// ── Work Experience ────────────────────────────────────────────────────────
function WorkExpForm({ items, onChange }) {
  const add = () => onChange([...items, { id: Date.now(), company: '', position: '', location: '', startDate: '', endDate: '', isCurrent: false, bullets: [''] }])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const update = (i, key, val) => onChange(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item))
  const addBullet = (i) => update(i, 'bullets', [...(items[i].bullets || []), ''])
  const updateBullet = (i, bi, val) => update(i, 'bullets', items[i].bullets.map((b, idx) => idx === bi ? val : b))
  const removeBullet = (i, bi) => update(i, 'bullets', items[i].bullets.filter((_, idx) => idx !== bi))

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item.id || i} className="border border-stone-200 rounded p-3 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-ink-500">{item.company || 'New position'}</span>
            <button onClick={() => remove(i)} className="text-danger hover:opacity-70 transition-opacity">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <Field label="Company"  value={item.company}  onChange={v => update(i,'company',v)}  placeholder="Google" />
          <Field label="Position" value={item.position} onChange={v => update(i,'position',v)} placeholder="Software Engineer" />
          <Field label="Location" value={item.location} onChange={v => update(i,'location',v)} placeholder="Remote" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Start" value={item.startDate} onChange={v => update(i,'startDate',v)} placeholder="Jan 2022" />
            {!item.isCurrent && <Field label="End" value={item.endDate} onChange={v => update(i,'endDate',v)} placeholder="Dec 2024" />}
          </div>
          <label className="flex items-center gap-2 text-xs text-ink-500 cursor-pointer">
            <input type="checkbox" checked={item.isCurrent || false} onChange={e => update(i,'isCurrent',e.target.checked)} className="rounded border-stone-300" />
            Currently working here
          </label>
          <div>
            <label className="label">Achievements / Responsibilities</label>
            {(item.bullets || []).map((b, bi) => (
              <div key={bi} className="flex gap-2 mb-1.5">
                <input className="input text-xs py-1.5 flex-1" value={b} onChange={e => updateBullet(i, bi, e.target.value)} placeholder="Increased deployment speed by 40%..." />
                <button onClick={() => removeBullet(i, bi)} className="text-ink-300 hover:text-danger transition-colors">×</button>
              </div>
            ))}
            <button onClick={() => addBullet(i)} className="text-xs text-ink-400 hover:text-ink-700 transition-colors mt-1">+ Add bullet</button>
          </div>
        </div>
      ))}
      <button onClick={add} className="btn-outline btn-sm w-full">+ Add Experience</button>
    </div>
  )
}

// ── Education ──────────────────────────────────────────────────────────────
function EducationForm({ items, onChange }) {
  const add = () => onChange([...items, { id: Date.now(), institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', gpa: '' }])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const update = (i, key, val) => onChange(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.id || i} className="border border-stone-200 rounded p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs font-medium text-ink-500">{item.institution || 'New education'}</span>
            <button onClick={() => remove(i)} className="text-danger text-xs">×</button>
          </div>
          <Field label="Institution"    value={item.institution}  onChange={v => update(i,'institution',v)}  placeholder="IIT Delhi" />
          <Field label="Degree"         value={item.degree}       onChange={v => update(i,'degree',v)}       placeholder="B.Tech" />
          <Field label="Field of study" value={item.fieldOfStudy} onChange={v => update(i,'fieldOfStudy',v)} placeholder="Computer Science" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Start" value={item.startDate} onChange={v => update(i,'startDate',v)} placeholder="2018" />
            <Field label="End"   value={item.endDate}   onChange={v => update(i,'endDate',v)}   placeholder="2022" />
          </div>
          <Field label="GPA / Score" value={item.gpa} onChange={v => update(i,'gpa',v)} placeholder="8.5 / 10" />
        </div>
      ))}
      <button onClick={add} className="btn-outline btn-sm w-full">+ Add Education</button>
    </div>
  )
}

// ── Skills ─────────────────────────────────────────────────────────────────
function SkillsForm({ items, onChange }) {
  const [input, setInput] = useState('')
  const add = () => {
    const trimmed = input.trim()
    if (!trimmed || items.includes(trimmed)) return
    onChange([...items, trimmed])
    setInput('')
  }
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          className="input text-sm flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="React, Node.js, Python…"
        />
        <button onClick={add} className="btn-primary btn-sm">Add</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map(skill => (
          <span key={skill} className="flex items-center gap-1.5 px-2.5 py-1 bg-ink-100 text-ink-700 text-xs rounded font-medium">
            {skill}
            <button onClick={() => onChange(items.filter(s => s !== skill))} className="text-ink-400 hover:text-danger transition-colors">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Projects ───────────────────────────────────────────────────────────────
function ProjectsForm({ items, onChange }) {
  const add = () => onChange([...items, { id: Date.now(), name: '', description: '', technologies: [], url: '', githubUrl: '' }])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const update = (i, key, val) => onChange(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.id || i} className="border border-stone-200 rounded p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs font-medium text-ink-500">{item.name || 'New project'}</span>
            <button onClick={() => remove(i)} className="text-danger text-xs">×</button>
          </div>
          <Field label="Project name" value={item.name} onChange={v => update(i,'name',v)} placeholder="ResumeAI" />
          <div>
            <label className="label">Description</label>
            <textarea className="textarea text-xs py-2 min-h-16" rows={2} value={item.description || ''} onChange={e => update(i,'description',e.target.value)} placeholder="Built a full-stack app..." />
          </div>
          <Field label="Technologies (comma-separated)" value={(item.technologies||[]).join(', ')} onChange={v => update(i,'technologies',v.split(',').map(t=>t.trim()).filter(Boolean))} placeholder="React, Node.js, PostgreSQL" />
          <Field label="Live URL"   value={item.url || ''}       onChange={v => update(i,'url',v)}       placeholder="https://..." />
          <Field label="GitHub URL" value={item.githubUrl || ''} onChange={v => update(i,'githubUrl',v)} placeholder="https://github.com/..." />
        </div>
      ))}
      <button onClick={add} className="btn-outline btn-sm w-full">+ Add Project</button>
    </div>
  )
}

// ── Certifications ─────────────────────────────────────────────────────────
function CertificationsForm({ items, onChange }) {
  const add = () => onChange([...items, { id: Date.now(), name: '', issuer: '', issueDate: '', credentialUrl: '' }])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const update = (i, key, val) => onChange(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.id || i} className="border border-stone-200 rounded p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs font-medium text-ink-500">{item.name || 'New cert'}</span>
            <button onClick={() => remove(i)} className="text-danger text-xs">×</button>
          </div>
          <Field label="Certification name" value={item.name} onChange={v => update(i,'name',v)} placeholder="AWS Certified Solutions Architect" />
          <Field label="Issuer" value={item.issuer} onChange={v => update(i,'issuer',v)} placeholder="Amazon Web Services" />
          <Field label="Date" value={item.issueDate} onChange={v => update(i,'issueDate',v)} placeholder="Mar 2024" />
          <Field label="Credential URL" value={item.credentialUrl||''} onChange={v => update(i,'credentialUrl',v)} placeholder="https://..." />
        </div>
      ))}
      <button onClick={add} className="btn-outline btn-sm w-full">+ Add Certification</button>
    </div>
  )
}

// ── Shared field component ────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input text-sm py-2"
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
