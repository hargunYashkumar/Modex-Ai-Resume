/**
 * formatDate — display-friendly date from ISO string or date object
 */
export function formatDate(date, opts = {}) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...opts,
  })
}

/**
 * relativeDate — "3 days ago", "just now", etc.
 */
export function relativeDate(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return formatDate(date, { day: 'numeric', month: 'short' })
}

/**
 * truncate — clip text and add ellipsis
 */
export function truncate(str, maxLen = 100) {
  if (!str || str.length <= maxLen) return str
  return str.slice(0, maxLen).trimEnd() + '…'
}

/**
 * atsColor — returns a Tailwind text color class based on ATS score
 */
export function atsScoreColor(score) {
  if (!score) return 'text-ink-400'
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

/**
 * atsLabel — human-readable ATS tier
 */
export function atsScoreLabel(score) {
  if (!score) return 'Not scored'
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs work'
}

/**
 * initialsFromName — "Arjun Mehta" → "AM"
 */
export function initialsFromName(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

/**
 * classNames — joins conditional class strings (like clsx, without dependency)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
