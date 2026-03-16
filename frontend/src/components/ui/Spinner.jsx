/**
 * Spinner — reusable loading indicator
 * Usage: <Spinner /> | <Spinner size="lg" /> | <Spinner className="text-gold-400" />
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-8 h-8', xl: 'w-12 h-12' }
  return (
    <svg
      className={`animate-spin ${sizes[size] || sizes.md} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
    >
      <circle
        className="opacity-20"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

/**
 * FullPageSpinner — centred spinner for route-level loading states
 */
export function FullPageSpinner({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Spinner size="lg" className="text-ink-400" />
      <p className="text-sm text-ink-400">{message}</p>
    </div>
  )
}
