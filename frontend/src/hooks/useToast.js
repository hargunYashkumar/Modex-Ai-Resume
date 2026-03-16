/**
 * useToast — thin wrapper around react-hot-toast with branded styling.
 * Provides success, error, loading, promise helpers with consistent UX.
 *
 * Usage:
 *   const { success, error, promise } = useToast()
 *   success('Resume saved!')
 *   error('Failed to load')
 *   promise(apiCall(), { loading: 'Saving...', success: 'Saved!', error: 'Failed' })
 */
import toast from 'react-hot-toast'

// Pre-configured options matching our ink/gold palette (set globally in main.jsx)
const baseOpts = {}

export function useToast() {
  return {
    success: (msg, opts) => toast.success(msg, { ...baseOpts, ...opts }),
    error:   (msg, opts) => toast.error(msg, { ...baseOpts, ...opts }),
    loading: (msg, opts) => toast.loading(msg, { ...baseOpts, ...opts }),
    dismiss: (id)        => toast.dismiss(id),

    /** Wraps a promise: shows loading → success/error automatically */
    promise: (prom, messages, opts) =>
      toast.promise(prom, messages, { ...baseOpts, ...opts }),

    /** Convenience: auto-dismiss after save with undo option (future) */
    saved: (msg = 'Changes saved') =>
      toast.success(msg, { duration: 2000, ...baseOpts }),

    /** Convenience: AI operation feedback */
    ai: (msg) =>
      toast.success(msg, {
        icon: '✦',
        style: {
          background: '#1C2540',
          color: '#F5F4F0',
          border: '1px solid #C9A84C',
          borderRadius: '4px',
        },
        duration: 3000,
      }),
  }
}
