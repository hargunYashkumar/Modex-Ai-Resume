import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'

const useResumeStore = create((set, get) => ({
  resumes: [],
  currentResume: null,
  isLoading: false,
  isSaving: false,
  atsAnalysis: null,

  fetchResumes: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/resumes')
      set({ resumes: data.resumes })
    } catch (e) {
      toast.error('Failed to load resumes')
    } finally {
      set({ isLoading: false })
    }
  },

  fetchResume: async (id) => {
    set({ isLoading: true })
    try {
      const { data } = await api.get(`/resumes/${id}`)
      set({ currentResume: data.resume })
      return data.resume
    } catch (e) {
      toast.error('Resume not found')
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  createResume: async (payload) => {
    try {
      const { data } = await api.post('/resumes', payload)
      set(s => ({ 
        resumes: [data.resume, ...s.resumes],
        currentResume: data.resume 
      }))
      toast.success('Resume created!')
      return data.resume
    } catch (e) {
      toast.error('Failed to create resume')
      return null
    }
  },

  updateResume: async (id, payload) => {
    set({ isSaving: true })
    try {
      const { data } = await api.put(`/resumes/${id}`, payload)
      set(s => ({
        resumes: s.resumes.map(r => r.id === id ? { ...r, ...data.resume } : r),
        currentResume: s.currentResume?.id === id ? data.resume : s.currentResume,
      }))
      return data.resume
    } catch (e) {
      toast.error('Failed to save resume')
      return null
    } finally {
      set({ isSaving: false })
    }
  },

  deleteResume: async (id) => {
    try {
      await api.delete(`/resumes/${id}`)
      set(s => ({ resumes: s.resumes.filter(r => r.id !== id) }))
      toast.success('Resume deleted')
    } catch (e) {
      toast.error('Failed to delete resume')
    }
  },

  duplicateResume: async (id) => {
    try {
      const { data } = await api.post(`/resumes/${id}/duplicate`)
      set(s => ({ resumes: [data.resume, ...s.resumes] }))
      toast.success('Resume duplicated!')
      return data.resume
    } catch (e) {
      toast.error('Failed to duplicate resume')
      return null
    }
  },

  setCurrentResume: (resume) => set({ currentResume: resume }),

  updateCurrentResumeField: (path, value) => {
    set(s => {
      if (!s.currentResume) return {}
      const updated = { ...s.currentResume }
      const keys = path.split('.')
      let obj = updated
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return { currentResume: updated }
    })
  },

  setAtsAnalysis: (analysis) => set({ atsAnalysis: analysis }),
}))

export default useResumeStore
