import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Modal — accessible, animated dialog
 *
 * Usage:
 *   <Modal open={show} onClose={() => setShow(false)} title="Confirm delete">
 *     <p>Are you sure?</p>
 *   </Modal>
 */
export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-[2px]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`bg-white rounded-lg shadow-float w-full ${maxWidth} overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
                <h2 className="text-lg font-serif text-ink-800">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded text-ink-300 hover:text-ink-600 hover:bg-stone-100 transition-colors"
                  aria-label="Close"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * ConfirmModal — quick helper for destructive-action confirmations
 */
export function ConfirmModal({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {message && <p className="text-sm text-ink-500 mb-6 leading-relaxed">{message}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => { onConfirm(); onClose() }}
          className={danger ? 'btn-danger flex-1' : 'btn-primary flex-1'}
        >
          {confirmLabel}
        </button>
        <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
      </div>
    </Modal>
  )
}
