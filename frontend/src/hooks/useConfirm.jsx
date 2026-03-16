import { useState, useCallback, useRef } from 'react'
import { ConfirmModal } from '../components/ui/Modal'

/**
 * useConfirm — imperative confirmation dialog.
 * Returns a `confirm(options)` function that resolves to true/false,
 * and a `ConfirmUI` component to render in the component tree.
 *
 * Usage:
 *   const { confirm, ConfirmUI } = useConfirm()
 *
 *   const handleDelete = async () => {
 *     const ok = await confirm({
 *       title:        'Delete resume?',
 *       message:      'This action cannot be undone.',
 *       confirmLabel: 'Delete',
 *       danger:       true,
 *     })
 *     if (ok) deleteResume(id)
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={handleDelete}>Delete</button>
 *       <ConfirmUI />
 *     </>
 *   )
 */
export function useConfirm() {
  const [open,    setOpen]    = useState(false)
  const [options, setOptions] = useState({})
  const resolveRef            = useRef(null)

  const confirm = useCallback((opts = {}) => {
    setOptions(opts)
    setOpen(true)
    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setOpen(false)
    resolveRef.current?.(true)
  }, [])

  const handleCancel = useCallback(() => {
    setOpen(false)
    resolveRef.current?.(false)
  }, [])

  const ConfirmUI = useCallback(() => {
    return (
      <ConfirmModal
        open={open}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmLabel={options.confirmLabel}
        danger={options.danger}
      />
    )
  }, [open, options, handleCancel, handleConfirm])

  return { confirm, ConfirmUI }
}
