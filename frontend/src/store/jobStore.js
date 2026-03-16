import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'

const useJobStore = create((set, get) => ({
  savedJobs:    [],
  jobResults:   null,
  isLoading:    false,
  isSearching:  false,

  fetchSavedJobs: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/jobs/saved')
      set({ savedJobs: data.jobs })
    } catch {
      toast.error('Failed to load saved jobs')
    } finally {
      set({ isLoading: false })
    }
  },

  saveJob: async (jobData, matchScore) => {
    try {
      const { data } = await api.post('/jobs/save', { jobData, matchScore })
      set(s => ({ savedJobs: [data.job, ...s.savedJobs] }))
      toast.success('Job saved!')
      return data.job
    } catch {
      toast.error('Failed to save job')
      return null
    }
  },

  updateJobStatus: async (id, status) => {
    try {
      await api.patch(`/jobs/${id}/status`, { status })
      set(s => ({
        savedJobs: s.savedJobs.map(j => j.id === id ? { ...j, status } : j),
      }))
    } catch {
      toast.error('Failed to update status')
    }
  },

  removeJob: async (id) => {
    try {
      await api.delete(`/jobs/${id}`)
      set(s => ({ savedJobs: s.savedJobs.filter(j => j.id !== id) }))
      toast.success('Job removed')
    } catch {
      toast.error('Failed to remove job')
    }
  },

  findJobs: async ({ resumeContent, location, jobType }) => {
    set({ isSearching: true, jobResults: null })
    try {
      const { data } = await api.post('/ai/job-matches', { resumeContent, location, jobType })
      set({ jobResults: data })
      return data
    } catch {
      toast.error('Job matching failed. Please try again.')
      return null
    } finally {
      set({ isSearching: false })
    }
  },

  clearResults: () => set({ jobResults: null }),
}))

export default useJobStore
