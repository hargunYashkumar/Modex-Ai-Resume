import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../utils/api'

export default function ExportPanel({ resume }) {
  const [exporting,  setExporting]  = useState(null)
  const [shareLink,  setShareLink]  = useState(null)
  const [shareStats, setShareStats] = useState(null)
  const [loadingShare, setLoadingShare] = useState(false)

  useEffect(() => {
    if (resume?.id) {
      api.get(`/share/${resume.id}/stats`)
        .then(({ data }) => setShareStats(data.shareLink))
        .catch(() => {})
    }
  }, [resume?.id])

  const exportPDF = async () => {
    const el = document.getElementById('resume-preview-root')
    if (!el) return toast.error('Preview not found')
    setExporting('pdf')
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (canvas.height * pdfW) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
      pdf.save(`${resume.title || 'resume'}.pdf`)
      toast.success('PDF downloaded!')
    } catch {
      toast.error('PDF export failed')
    } finally {
      setExporting(null)
    }
  }

  const exportDOCX = async () => {
    if (!resume?.content) return toast.error('No resume content to export')
    setExporting('docx')
    try {
      const { exportToDocx } = await import('../../utils/exportDocx')
      await exportToDocx(resume)
      toast.success('DOCX downloaded!')
    } catch (e) {
      console.error(e)
      toast.error('DOCX export failed')
    } finally {
      setExporting(null)
    }
  }
  const exportHTML = async () => {
    const el = document.getElementById('resume-preview-root')
    if (!el) return toast.error('Preview not found')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${resume.title}</title></head><body style="margin:0">${el.outerHTML}</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${resume.title || 'resume'}.html`; a.click()
    URL.revokeObjectURL(url)
    toast.success('HTML downloaded!')
  }

  const generateShareLink = async () => {
    if (!resume?.id) return toast.error('Save your resume first')
    setLoadingShare(true)
    try {
      const { data } = await api.post(`/share/${resume.id}/generate`, { expiresInDays: 30 })
      setShareLink(data.shareUrl)
      setShareStats({ url: data.shareUrl, viewCount: 0, isActive: true, expiresAt: data.expiresAt })
      await navigator.clipboard.writeText(data.shareUrl)
      toast.success('Share link copied to clipboard!')
    } catch {
      toast.error('Failed to generate share link')
    } finally {
      setLoadingShare(false)
    }
  }

  const revokeShareLink = async () => {
    if (!resume?.id) return
    try {
      await api.delete(`/share/${resume.id}`)
      setShareLink(null)
      setShareStats(null)
      toast.success('Share link revoked')
    } catch {
      toast.error('Failed to revoke link')
    }
  }

  const copyLink = async () => {
    const url = shareStats?.url || shareLink
    if (!url) return
    await navigator.clipboard.writeText(url)
    toast.success('Link copied!')
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-medium text-ink-700 mb-1">Export resume</h3>
      <p className="text-xs text-ink-400 mb-5">Download or share your resume.</p>

      <div className="space-y-3 mb-6">
        {/* PDF */}
        <button
          onClick={exportPDF}
          disabled={exporting === 'pdf'}
          className="w-full text-left bg-ink-700 border-2 border-ink-700 hover:bg-ink-600 rounded-lg p-4 flex items-center gap-4 transition-all"
        >
          <span className="text-2xl">📄</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-stone-50">
              {exporting === 'pdf' ? 'Generating…' : 'Download PDF'}
            </div>
            <div className="text-xs text-ink-300 mt-0.5">Best for job applications</div>
          </div>
          {exporting === 'pdf'
            ? <svg className="animate-spin w-4 h-4 text-stone-200 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)" strokeWidth={2} className="flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          }
        </button>

        {/* DOCX */}
        <button
          onClick={exportDOCX}
          disabled={exporting === 'docx'}
          className="w-full text-left bg-white border-2 border-stone-200 hover:border-ink-300 rounded-lg p-4 flex items-center gap-4 transition-all"
        >
          <span className="text-2xl">📝</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink-700">
              {exporting === 'docx' ? 'Generating…' : 'Download DOCX'}
            </div>
            <div className="text-xs text-ink-400 mt-0.5">Microsoft Word format</div>
          </div>
          {exporting === 'docx'
            ? <svg className="animate-spin w-4 h-4 text-ink-400 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            : null
          }
        </button>
        <button
          onClick={exportHTML}
          className="w-full text-left bg-white border-2 border-stone-200 hover:border-ink-300 rounded-lg p-4 flex items-center gap-4 transition-all"
        >
          <span className="text-2xl">🌐</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink-700">Download HTML</div>
            <div className="text-xs text-ink-400 mt-0.5">Editable web version</div>
          </div>
        </button>
      </div>

      {/* Share link section */}
      <div className="border-t border-stone-200 pt-5">
        <h4 className="text-xs font-medium text-ink-600 uppercase tracking-wide mb-3">Share link</h4>

        {shareStats?.isActive ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded">
              <span className="text-xs text-ink-500 truncate flex-1">{shareStats.url}</span>
              <button onClick={copyLink} className="btn-ghost btn-sm px-2 flex-shrink-0 text-xs">Copy</button>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-400">
              <span>{shareStats.viewCount || 0} view{shareStats.viewCount !== 1 ? 's' : ''}</span>
              <button onClick={revokeShareLink} className="text-danger hover:opacity-70 transition-opacity">Revoke link</button>
            </div>
          </div>
        ) : (
          <button
            onClick={generateShareLink}
            disabled={loadingShare || !resume?.id}
            className="w-full text-left bg-white border-2 border-stone-200 hover:border-ink-300 rounded-lg p-4 flex items-center gap-4 transition-all disabled:opacity-50"
          >
            <span className="text-2xl">🔗</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink-700">
                {loadingShare ? 'Generating…' : 'Generate share link'}
              </div>
              <div className="text-xs text-ink-400 mt-0.5">Public view · expires in 30 days</div>
            </div>
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-lg">
        <h4 className="text-xs font-medium text-ink-600 mb-2">Tips</h4>
        <ul className="space-y-1.5 text-xs text-ink-400">
          <li className="flex gap-2"><span className="text-gold-500 flex-shrink-0">→</span>PDF is best for ATS systems — they parse it reliably.</li>
          <li className="flex gap-2"><span className="text-gold-500 flex-shrink-0">→</span>DOCX works well when recruiters want an editable copy.</li>
          <li className="flex gap-2"><span className="text-gold-500 flex-shrink-0">→</span>Share links let recruiters view your resume without downloading.</li>
          <li className="flex gap-2"><span className="text-gold-500 flex-shrink-0">→</span>Save the resume before exporting for best results.</li>
        </ul>
      </div>
    </div>
  )
}
