import { useCallback } from 'react'
import useResumeStore from '../store/resumeStore'

/**
 * useResume(id?) — convenience hook for working with a single resume.
 *
 * When given an id, exposes the current resume from the store.
 * Provides stable, memoised callbacks for common operations.
 */
export function useResume(id) {
  const {
    currentResume,
    isSaving,
    updateResume,
    setCurrentResume,
  } = useResumeStore()

  const updateContent = useCallback((newContent) => {
    if (!currentResume) return
    setCurrentResume({ ...currentResume, content: newContent })
  }, [currentResume, setCurrentResume])

  const updateCustomization = useCallback((newCustom) => {
    if (!currentResume) return
    setCurrentResume({ ...currentResume, customization: newCustom })
  }, [currentResume, setCurrentResume])

  const save = useCallback(async () => {
    if (!currentResume?.id) return null
    return updateResume(currentResume.id, {
      title:         currentResume.title,
      content:       currentResume.content,
      customization: currentResume.customization,
      templateId:    currentResume.template_id,
    })
  }, [currentResume, updateResume])

  return {
    resume:              currentResume,
    isSaving,
    updateContent,
    updateCustomization,
    save,
  }
}
