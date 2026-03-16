import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useResumeStore from '../store/resumeStore'
import { useAutoSave } from '../hooks/useAutoSave'
import { useBuilderShortcuts } from '../hooks/useKeyboardShortcut'
import { useTitle } from '../hooks'

import ResumeEditor    from '../components/resume/ResumeEditor'
import ResumePreview   from '../components/resume/ResumePreview'
import TemplatePicker  from '../components/resume/TemplatePicker'
import CustomiserPanel from '../components/resume/CustomiserPanel'
import AiToolbar       from '../components/resume/AiToolbar'
import ExportPanel     from '../components/resume/ExportPanel'
import Spinner         from '../components/ui/Spinner'

const TABS = [
  { id: 'editor',    label: 'Edit' },
  { id: 'templates', label: 'Templates' },
  { id: 'customise', label: 'Style' },
  { id: 'ai',        label: '✦ AI Tools' },
  { id: 'export',    label: 'Export' },
]

const DEFAULT_CONTENT = {
  personalInfo:   { name:'', email:'', phone:'', location:'', summary:'', linkedinUrl:'', githubUrl:'' },
  workExperience: [],
  education:      [],
  skills:         [],
  projects:       [],
  certifications: [],
}

const DEFAULT_CUSTOMIZATION = {
  primaryColor: '#1C2540',
  accentColor:  '#C9A84C',
  fontFamily:   'DM Sans',
  fontSize:     14,
  spacing:      'normal',
  sections: {
    summary: true, workExperience: true, education: true,
    skills: true, projects: true, certifications: true,
  },
}

export default function ResumeBuilder() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const {
    currentResume, fetchResume, createResume, updateResume,
    isSaving, setCurrentResume,
  } = useResumeStore()

  const [activePanel,  setActivePanel]  = useState('editor')
  const [previewMode,  setPreviewMode]  = useState(false)
  const [initialised,  setInitialised]  = useState(false)

  // Initialise
  useEffect(() => {
    if (id) {
      fetchResume(id).then(() => setInitialised(true))
    } else {
      setCurrentResume({
        id: null, title: 'Untitled Resume', template_id: 'modern',
        status: 'draft', content: DEFAULT_CONTENT, customization: DEFAULT_CUSTOMIZATION,
      })
      setInitialised(true)
    }
  }, [id])

  // Save function
  const performSave = useCallback(async () => {
    if (!currentResume?.id) return
    await updateResume(currentResume.id, {
      title:         currentResume.title,
      content:       currentResume.content,
      customization: currentResume.customization,
      templateId:    currentResume.template_id,
    })
  }, [currentResume, updateResume])

  const handleManualSave = useCallback(async () => {
    if (!currentResume) return
    if (!currentResume.id) {
      const r = await createResume({
        title:         currentResume.title,
        templateId:    currentResume.template_id,
        content:       currentResume.content,
        customization: currentResume.customization,
      })
      if (r) navigate(`/resumes/${r.id}/edit`, { replace: true })
    } else {
      await performSave()
      toast.success('Saved!')
    }
  }, [currentResume, createResume, navigate, performSave])

  useTitle(currentResume?.title || 'Resume Builder')

  // Auto-save 2.5s after any content/customization change
  useAutoSave(
    currentResume ? JSON.stringify({ c: currentResume.content, s: currentResume.customization }) : null,
    performSave,
    2500,
    !!(currentResume?.id)
  )

  // Keyboard shortcuts: Cmd/Ctrl+S, Cmd/Ctrl+P, number keys 1-5
  useBuilderShortcuts({
    onSave:          handleManualSave,
    onTogglePreview: () => setPreviewMode(v => !v),
    onSwitchPanel:   (panel) => {
      // Only switch if not currently focused in a text input
      if (document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
        setActivePanel(panel)
      }
    },
  })

  const handleContentChange = useCallback((newContent) => {
    if (!currentResume) return
    setCurrentResume({ ...currentResume, content: newContent })
  }, [currentResume, setCurrentResume])

  const handleCustomizationChange = useCallback((newCustom) => {
    if (!currentResume) return
    setCurrentResume({ ...currentResume, customization: newCustom })
  }, [currentResume, setCurrentResume])

  if (!initialised || !currentResume) {
    return (
      <div className="flex-1 flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-ink-400" />
          <p className="text-sm text-ink-400">Loading resume…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-b border-stone-200 flex-shrink-0 min-w-0">
        <button onClick={() => navigate('/resumes')} className="btn-ghost btn-sm px-2 flex-shrink-0">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <input
          className="flex-1 min-w-0 max-w-xs font-medium text-sm text-ink-700 bg-transparent
                     border border-transparent rounded px-2 py-1
                     hover:border-stone-200 focus:border-ink-400 outline-none transition-colors"
          value={currentResume.title}
          onChange={e => setCurrentResume({ ...currentResume, title: e.target.value })}
          onBlur={handleManualSave}
        />

        <div className="hidden md:flex items-center gap-0.5 bg-stone-100 p-1 rounded ml-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActivePanel(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap ${
                activePanel === tab.id ? 'bg-white text-ink-700 shadow-sm' : 'text-ink-400 hover:text-ink-600'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {isSaving && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-ink-300">
              <Spinner size="sm" /> Saving…
            </span>
          )}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`btn-sm ${previewMode ? 'btn-primary' : 'btn-outline'}`}
          >
            {previewMode ? '← Edit' : 'Preview'}
          </button>
          <button onClick={handleManualSave} className="btn-primary btn-sm" title="Save (⌘S)">Save</button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {!previewMode && (
          <div className="w-full md:w-96 lg:w-[420px] flex-shrink-0 bg-white border-r border-stone-200 overflow-y-auto">
            {/* Mobile tabs */}
            <div className="md:hidden flex overflow-x-auto gap-1 bg-stone-100 m-3 p-1 rounded">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActivePanel(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-all ${activePanel === tab.id ? 'bg-white text-ink-700 shadow-sm' : 'text-ink-400'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activePanel === 'editor'    && <ResumeEditor    content={currentResume.content}        onChange={handleContentChange} />}
            {activePanel === 'templates' && <TemplatePicker  current={currentResume.template_id}    onSelect={tid => setCurrentResume({ ...currentResume, template_id: tid })} />}
            {activePanel === 'customise' && <CustomiserPanel customization={currentResume.customization} onChange={handleCustomizationChange} />}
            {activePanel === 'ai'        && <AiToolbar       resume={currentResume}                  onUpdate={handleContentChange} />}
            {activePanel === 'export'    && <ExportPanel     resume={currentResume} />}
          </div>
        )}

        <div className="flex-1 bg-stone-200 overflow-auto flex items-start justify-center py-8 px-4">
          <div
            id="resume-preview-root"
            className="bg-white shadow-float flex-shrink-0"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            <ResumePreview resume={currentResume} />
          </div>
        </div>
      </div>
    </div>
  )
}
