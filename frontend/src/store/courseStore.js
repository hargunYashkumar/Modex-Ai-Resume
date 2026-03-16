import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'

const useCourseStore = create((set) => ({
  recommendations: null,
  history:         [],
  isLoading:       false,

  fetchHistory: async () => {
    try {
      const { data } = await api.get('/courses/history')
      set({ history: data.recommendations })
    } catch {}
  },

  getRecommendations: async ({ resumeContent, targetRole, resumeId }) => {
    set({ isLoading: true, recommendations: null })
    try {
      const { data } = await api.post('/ai/course-recommendations', {
        resumeContent, targetRole, resumeId,
      })
      set({ recommendations: data })
      return data
    } catch {
      toast.error('Failed to get recommendations. Please try again.')
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  clearRecommendations: () => set({ recommendations: null }),
}))

export default useCourseStore
