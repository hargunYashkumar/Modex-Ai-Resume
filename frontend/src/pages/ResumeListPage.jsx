import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import useResumeStore from '../store/resumeStore'
import api from '../utils/api'
import { useTitle, useConfirm } from '../hooks'

export default function ResumeListPage() {
  useTitle('My Resumes')
  const { resumes, fetchResumes, createResume, deleteResume, duplicateResume, isLoading } = useResumeStore()
  const { confirm, ConfirmUI } = useConfirm()
  const [showCreate,     setShowCreate]     = useState(false)
  const [newTitle,       setNewTitle]       = useState('')
  const [uploading,      setUploading]      = useState(false)
  const [searchParams]   = useSearchParams()
  const dropzoneRef      = useRef(null)
  const navigate = useNavigate()
  useTitle('My Resumes')

  useEffect(() => {
    fetchResumes()
    // If navigated with ?upload=1, auto-focus the dropzone
    if (searchParams.get('upload') === '1') {
      setTimeout(() => {
        dropzoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: async (files) => {
      if (!files[0]) return
      setUploading(true)
      try {
        const form = new FormData()
        form.append('resume', files[0])
        const { data } = await api.post('/resumes/upload/parse', form)
        console.log('[Upload] Step 1: Text extracted. Length:', data.extractedText?.length)

        const { data: parsedRes } = await api.post('/ai/parse-resume', { text: data.extractedText })
        const parsedData = parsedRes.parsed
        console.log('[Upload] Step 2: AI parsed result:', parsedData)

        // Validate parsed data
        if (!parsedData || (!parsedData.personalInfo && !parsedData.workExperience)) {
          console.error('[Upload] AI returned empty or invalid structure:', parsedData)
          throw new Error('AI failed to find resume details in the uploaded file. Please try a different file.')
        }

        const payload = { 
          title: files[0].name.replace(/\.[^.]+$/, ''), 
          content: parsedData 
        }
        console.log('[Upload] Step 3: Creating resume with payload:', payload)

        const resume = await createResume(payload)
        if (resume) {
          console.log('[Upload] Step 4: Resume created successfully. ID:', resume.id)
          navigate(`/resumes/${resume.id}/edit`)
        }
      } catch (e) {
        console.error('[Upload] Error during parsing:', e)
        const msg = e.response?.data?.error || e.message || 'Failed to parse resume'
        toast.error(msg)
      } finally {
        setUploading(false)
      }
    },
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const r = await createResume({ title: newTitle.trim() })
    if (r) { setShowCreate(false); setNewTitle(''); navigate(`/resumes/${r.id}/edit`) }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">My Resumes</h1>
          <p className="section-sub">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          New resume
        </button>
      </div>

      {/* Upload dropzone */}
      <div
        ref={dropzoneRef}
        {...getRootProps()}
        className={`mb-8 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-gold-400 bg-gold-50'
            : searchParams.get('upload') === '1'
            ? 'border-ink-400 bg-stone-50'
            : 'border-stone-300 hover:border-ink-400 bg-white hover:bg-stone-50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-ink-700 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-ink-500">Parsing your resume with AI...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded border-2 border-stone-200 flex items-center justify-center text-ink-300 mb-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-ink-700">
              {isDragActive ? 'Drop to parse your resume' : 'Upload existing resume'}
            </p>
            <p className="text-xs text-ink-400">PDF or DOCX · Max 5 MB · AI will extract all details</p>
          </div>
        )}
      </div>

      {/* Resume grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : resumes.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl text-ink-200 mb-4">◈</p>
          <h3 className="font-medium text-ink-700 mb-2">Start your first resume</h3>
          <p className="text-sm text-ink-400 mb-6">Upload an existing resume or build from scratch.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">Build from scratch</button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {resumes.map(r => (
              <motion.div key={r.id} layout initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.94 }}>
                <ResumeCard
                  resume={r}
                  onEdit={() => navigate(`/resumes/${r.id}/edit`)}
                  onDuplicate={() => duplicateResume(r.id)}
                  onDelete={async () => {
                    const ok = await confirm({
                      title: 'Delete resume?',
                      message: `"${r.title}" will be permanently deleted.`,
                      confirmLabel: 'Delete',
                      danger: true,
                    })
                    if (ok) deleteResume(r.id)
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <Modal onClose={() => setShowCreate(false)}>
            <h2 className="text-xl font-serif text-ink-800 mb-4">New Resume</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Resume title</label>
                <input
                  className="input" autoFocus
                  placeholder="e.g. Software Engineer — Google 2025"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </Modal>
        )}

      </AnimatePresence>
      <ConfirmUI />
    </div>
  )
}

function ResumeCard({ resume, onEdit, onDuplicate, onDelete }) {
  const statusColors = { draft: 'badge-ink', published: 'badge-success', archived: 'badge-danger' }
  return (
    <div className="card group hover:border-ink-300 transition-all hover:-translate-y-0.5" style={{ boxShadow: '0 1px 3px rgba(28,37,64,0.08)' }}>
      {/* Preview area */}
      <div
        onClick={onEdit}
        className="h-32 rounded bg-stone-100 mb-4 flex items-center justify-center cursor-pointer group-hover:bg-ink-700 transition-all"
        style={{ background: resume.primary_color ? `${resume.primary_color}10` : undefined }}
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}
          className="text-ink-200 group-hover:text-gold-400 transition-colors">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-sm text-ink-700 leading-snug truncate">{resume.title}</h3>
        <span className={statusColors[resume.status] || 'badge-ink'}>{resume.status}</span>
      </div>

      <p className="text-xs text-ink-400 mb-3">
        {new Date(resume.updated_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
      </p>

      {resume.ats_score && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-gold-400 rounded-full" style={{ width: `${resume.ats_score}%` }} />
          </div>
          <span className="text-2xs text-ink-400">ATS {resume.ats_score}%</span>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onEdit} className="btn-primary btn-sm flex-1">Edit</button>
        <button onClick={onDuplicate} className="btn-ghost btn-sm px-2.5" title="Duplicate">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </button>
        <button onClick={onDelete} className="btn-ghost btn-sm px-2.5 text-danger hover:bg-red-50" title="Delete">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-ink-900/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
        transition={{ duration:0.2 }}
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-float"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function SkeletonCard() {
  return <div className="card animate-pulse"><div className="h-32 bg-stone-100 rounded mb-4"/><div className="h-3 bg-stone-200 rounded w-3/4 mb-2"/><div className="h-3 bg-stone-100 rounded w-1/2"/></div>
}
