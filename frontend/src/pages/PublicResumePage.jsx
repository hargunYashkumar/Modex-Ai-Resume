import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import ResumePreview from '../components/resume/ResumePreview'
import { FullPageSpinner } from '../components/ui/Spinner'

export default function PublicResumePage() {
  const { token }  = useParams()
  const [resume,   setResume]  = useState(null)
  const [loading,  setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/share/${token}`)
      .then(({ data }) => {
        setResume(data.resume)
        if (data.resume?.title) {
          document.title = `${data.resume.title} — ResumeAI`
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <FullPageSpinner message="Loading resume…" />

  if (notFound) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl text-ink-200 mb-4">◈</div>
          <h1 className="text-2xl font-serif text-ink-800 mb-2">Resume not found</h1>
          <p className="text-sm text-ink-400 mb-6 leading-relaxed">
            This share link may have expired or been revoked.
          </p>
          <Link to="/" className="btn-primary btn-sm">Go to ResumeAI</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-200">
      {/* Top bar */}
      <div className="bg-ink-700 border-b border-ink-600 py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-gold-400 rounded flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1C2540" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <span className="font-serif text-stone-200 text-base">ResumeAI</span>
        </div>
        <div className="flex items-center gap-3">
          {resume?.title && (
            <span className="text-xs text-ink-300 hidden sm:block">{resume.title}</span>
          )}
          <Link to="/auth?signup=1" className="btn-gold btn-sm text-xs">
            Build your own →
          </Link>
        </div>
      </div>

      {/* Resume */}
      <div className="flex items-start justify-center py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-float"
          style={{ width: '210mm', minHeight: '297mm' }}
          id="resume-preview-root"
        >
          <ResumePreview resume={resume} />
        </motion.div>
      </div>

      {/* Footer CTA */}
      <div className="py-8 px-6 text-center">
        <p className="text-sm text-ink-500 mb-3">
          Created with <span className="font-medium text-ink-700">ResumeAI</span> — AI-powered resume builder
        </p>
        <Link to="/auth?signup=1" className="btn-primary btn-sm">
          Build your resume for free
        </Link>
      </div>
    </div>
  )
}
