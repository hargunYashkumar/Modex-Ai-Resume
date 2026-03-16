/**
 * Badge — small status/label pill
 * variant: 'ink' | 'gold' | 'success' | 'danger' | 'warning'
 */
export function Badge({ children, variant = 'ink', className = '' }) {
  const variants = {
    ink:     'bg-ink-100 text-ink-600 border-ink-200',
    gold:    'bg-gold-100 text-gold-700 border-gold-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    danger:  'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-medium rounded uppercase tracking-wide border ${variants[variant] || variants.ink} ${className}`}>
      {children}
    </span>
  )
}

/**
 * EmptyState — centered placeholder with icon, title, subtitle, and optional CTA
 */
export function EmptyState({ icon = '◈', title, subtitle, action, actionLabel }) {
  return (
    <div className="card text-center py-16 px-6">
      <div className="text-4xl text-ink-200 mb-4 select-none">{icon}</div>
      {title    && <h3 className="font-medium text-ink-700 mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-ink-400 mb-6 max-w-sm mx-auto leading-relaxed">{subtitle}</p>}
      {action && actionLabel && (
        <button onClick={action} className="btn-primary btn-sm">{actionLabel}</button>
      )}
    </div>
  )
}

/**
 * SkeletonLine — animated loading placeholder
 */
export function SkeletonLine({ width = 'w-full', height = 'h-3', className = '' }) {
  return (
    <div className={`${width} ${height} bg-stone-200 rounded animate-pulse ${className}`} />
  )
}

/**
 * SkeletonCard — full card skeleton
 */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card animate-pulse space-y-3">
      <SkeletonLine width="w-1/3" height="h-4" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLine key={i} width={i % 2 === 0 ? 'w-full' : 'w-3/4'} />
      ))}
    </div>
  )
}
