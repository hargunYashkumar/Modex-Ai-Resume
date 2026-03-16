import { motion } from 'framer-motion'

/**
 * LoadingScreen — full-page loading state shown during initial auth hydration.
 * Matches the app's dark navy palette so there's no flash of unstyled content.
 */
export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ink-700 flex flex-col items-center justify-center gap-5">
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-14 h-14 bg-gold-400 rounded-lg flex items-center justify-center"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1C2540" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </motion.div>

      {/* Wordmark */}
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="font-serif text-stone-200 text-xl tracking-tight"
      >
        ResumeAI
      </motion.span>

      {/* Spinner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-1.5"
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-gold-400"
          />
        ))}
      </motion.div>
    </div>
  )
}
