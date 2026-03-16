import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/api'
import Spinner from '../components/ui/Spinner'
import { useTitle } from '../hooks'

export default function ResetPasswordPage() {
  useTitle('Reset password')
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const token      = params.get('token')
  const [mode, setMode]         = useState(token ? 'reset' : 'forgot')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 8)  return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      toast.success('Password reset! Please sign in.')
      navigate('/auth')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 flex items-center justify-center">
            <img src="https://raw.githubusercontent.com/hargunYashkumar/MODEX/main/Gemini_Generated_Image_ebda0mebda0mebda%20(1)%20-%20Copy.png" alt="Modex Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif font-medium text-ink-700 text-lg">Modex</span>
        </Link>

        {mode === 'forgot' && !sent && (
          <>
            <h1 className="text-3xl font-serif text-ink-800 mb-1">Forgot password</h1>
            <p className="text-sm text-ink-400 mb-8">
              Enter your email and we'll send a reset link.
            </p>
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <><Spinner size="sm" /> Sending...</> : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        {mode === 'forgot' && sent && (
          <div className="text-center">
            <div className="text-5xl mb-6">✉</div>
            <h1 className="text-2xl font-serif text-ink-800 mb-2">Check your inbox</h1>
            <p className="text-sm text-ink-400 mb-8 leading-relaxed">
              We've sent a reset link to <strong className="text-ink-700">{email}</strong>. It expires in 1 hour.
            </p>
            <Link to="/auth" className="btn-outline btn-sm">Back to sign in</Link>
          </div>
        )}

        {mode === 'reset' && (
          <>
            <h1 className="text-3xl font-serif text-ink-800 mb-1">Set new password</h1>
            <p className="text-sm text-ink-400 mb-8">Choose a strong password for your account.</p>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="label">New password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <><Spinner size="sm" /> Resetting...</> : 'Reset password'}
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-center text-xs text-ink-400">
          <Link to="/auth" className="hover:text-ink-700 transition-colors">← Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
