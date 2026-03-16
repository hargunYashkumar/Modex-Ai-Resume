import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import api from '../utils/api'
import { useTitle } from '../hooks'

export default function AuthPage() {
  useTitle('Sign in')
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('signup') ? 'register' : 'login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  // Initialize Google Sign-In
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !window.google) {
      setGoogleLoaded(false)
      return
    }
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback,
    })
    window.google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      {
        theme: 'outline', size: 'large', width: '100%',
        text: mode === 'login' ? 'signin_with' : 'signup_with',
        shape: 'rectangular',
      }
    )
    setGoogleLoaded(true)
  }, [mode])

  const handleGoogleCallback = async (response) => {
    try {
      setLoading(true)
      const { data } = await api.post('/auth/google', { credential: response.credential })
      setAuth(data.user, data.token)
      toast.success(`Welcome, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error('Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form
      const { data } = await api.post(endpoint, payload)
      setAuth(data.user, data.token)
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Authentication failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-ink-700 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-ink [background-size:28px_28px] opacity-20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 flex items-center justify-center">
              <img src="https://raw.githubusercontent.com/hargunYashkumar/MODEX/main/Gemini_Generated_Image_ebda0mebda0mebda%20(1)%20-%20Copy.png" alt="Modex Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif text-stone-50 text-xl">Modex</span>
        </Link>

        <div className="relative z-10">
          <blockquote className="text-2xl font-serif text-stone-100 leading-relaxed mb-6">
            "I landed three interviews in two weeks after rebuilding my resume here."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gold-400/20 flex items-center justify-center text-gold-400 font-semibold">R</div>
            <div>
              <p className="text-stone-200 text-sm font-medium">Riya Sharma</p>
              <p className="text-ink-300 text-xs">Software Engineer, Bangalore</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-ink-300 text-xs">© {new Date().getFullYear()} Modex</p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 flex items-center justify-center">
                <img src="https://raw.githubusercontent.com/hargunYashkumar/MODEX/main/Gemini_Generated_Image_ebda0mebda0mebda%20(1)%20-%20Copy.png" alt="Modex Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif font-medium text-ink-700 text-lg">Modex</span>
          </Link>

          <h1 className="text-3xl font-serif text-ink-800 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-ink-400 mb-8">
            {mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-ink-700 font-medium underline-gold"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {/* Google button — shows when VITE_GOOGLE_CLIENT_ID is configured */}
          {googleLoaded ? (
            <div id="google-btn" className="mb-4 h-11" />
          ) : (
            <div className="mb-4 p-3 bg-stone-100 border border-stone-200 rounded text-xs text-ink-400 text-center">
              Google sign-in not configured —{' '}
              <span className="text-ink-600">use email/password below</span>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-ink-300 uppercase tracking-wide">or continue with email</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Full name</label>
                <input
                  className="input"
                  type="text" placeholder="Arjun Mehta"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label" style={{ marginBottom: 0 }}>Password</label>
                {mode === 'login' && (
                  <Link to="/auth/forgot-password" className="text-xs text-ink-400 hover:text-ink-700 transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                className="input"
                type="password"
                placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading
                ? <span className="flex items-center gap-2"><Spinner /> Processing...</span>
                : mode === 'login' ? 'Sign in' : 'Create account'
              }
            </button>
          </form>

          <p className="mt-6 text-xs text-ink-300 text-center leading-relaxed">
            By continuing, you agree to our{' '}
            <Link to="/legal/terms" className="underline">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/legal/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}
