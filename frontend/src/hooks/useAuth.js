import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'

/**
 * useAuth — convenience hook for auth operations in components.
 *
 * All methods throw on error so callers can catch and display
 * field-level validation messages.
 *
 * Returns:
 *   user, token, isAuthenticated  — current auth state
 *   isLoading                     — true while a request is in flight
 *   login(email, password)        — resolves to user, throws on failure
 *   loginWithGoogle(credential)   — resolves to user, throws on failure
 *   register(name, email, pass)   — resolves to user, throws on failure
 *   logout()                      — clears state + redirects
 */
export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.user, data.token)
      toast.success('Welcome back!')
      navigate('/dashboard')
      return data.user
    } finally {
      setIsLoading(false)
    }
  }, [setAuth, navigate])

  const loginWithGoogle = useCallback(async (credential) => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/google', { credential })
      setAuth(data.user, data.token)
      toast.success(`Welcome, ${data.user.name}!`)
      navigate('/dashboard')
      return data.user
    } finally {
      setIsLoading(false)
    }
  }, [setAuth, navigate])

  const register = useCallback(async (name, email, password) => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      setAuth(data.user, data.token)
      toast.success('Account created!')
      navigate('/dashboard')
      return data.user
    } finally {
      setIsLoading(false)
    }
  }, [setAuth, navigate])

  const logout = useCallback(() => {
    storeLogout()
    navigate('/auth')
    toast.success('Signed out')
  }, [storeLogout, navigate])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
  }
}
