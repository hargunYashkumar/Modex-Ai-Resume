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
        className="w-14 h-14 flex items-center justify-center"
      >
        <img src="https://raw.githubusercontent.com/hargunYashkumar/MODEX/main/Gemini_Generated_Image_ebda0mebda0mebda%20(1)%20-%20Copy.png" alt="Modex Logo" className="w-full h-full object-contain" />
      </motion.div>

      {/* Wordmark */}
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="font-serif text-stone-200 text-xl tracking-tight"
      >
        Modex
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
