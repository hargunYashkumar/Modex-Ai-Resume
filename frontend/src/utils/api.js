import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000,
  headers: { },
})

// ── Request interceptor ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // In development, log all outgoing requests
    if (import.meta.env.DEV) {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.error || error.message

    if (status === 401) {
      // Clear auth state and redirect to login
      // Use dynamic import to avoid circular dependency with the store
      import('../store/authStore').then(({ default: useAuthStore }) => {
        const state = useAuthStore.getState()
        state.logout()
      })
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/auth') &&
          window.location.pathname !== '/') {
        window.location.href = '/auth'
      }
    }

    if (status === 429) {
      toast.error('Too many requests — please slow down.')
    }

    if (status === 503) {
      toast.error('Service temporarily unavailable. Please try again.')
    }

    if (status >= 500 && status !== 503) {
      if (import.meta.env.DEV) {
        console.error(`[API] Server error ${status}:`, message)
      }
    }

    return Promise.reject(error)
  }
)

export default api
