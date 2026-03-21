import axios from 'axios'
import toast from 'react-hot-toast'

const rawBaseURL = import.meta.env.VITE_API_URL || '';
const baseURL = rawBaseURL.replace(/\/$/, '');

if (!rawBaseURL && import.meta.env.PROD) {
  console.error('[API] CRITICAL: VITE_API_URL is not set in production. All API calls will fail. Set this in your Vercel Environment Variables.')
}

if (import.meta.env.PROD && rawBaseURL.startsWith('/')) {
  console.error('[API] CRITICAL: VITE_API_URL must be an absolute backend URL in production (e.g. https://your-backend.vercel.app). Relative paths are not supported in two-project Vercel deployment.')
}

const api = axios.create({
  baseURL: baseURL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
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
