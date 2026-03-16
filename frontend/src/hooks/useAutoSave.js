import { useEffect, useRef, useCallback } from 'react'

/**
 * Triggers `saveFn` after the user stops making changes for `delay` ms.
 *
 * @param {*}        value   - The value to watch (resume content, customization, etc.)
 * @param {Function} saveFn  - Async function to call when saving
 * @param {number}   delay   - Idle time in ms before saving (default 2500)
 * @param {boolean}  enabled - Set to false to pause auto-save (e.g. while loading)
 */
export function useAutoSave(value, saveFn, delay = 2500, enabled = true) {
  const timerRef     = useRef(null)
  const saveFnRef    = useRef(saveFn)
  const isFirstRender = useRef(true)

  // Keep saveFn reference up-to-date without re-registering the effect
  useEffect(() => { saveFnRef.current = saveFn }, [saveFn])

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const saveNow = useCallback(() => {
    cancel()
    saveFnRef.current()
  }, [cancel])

  useEffect(() => {
    // Skip the very first render so we don't save on mount
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!enabled) return

    cancel()
    timerRef.current = setTimeout(() => {
      saveFnRef.current()
    }, delay)

    return cancel
  }, [value, delay, enabled, cancel])

  // Flush on unmount
  useEffect(() => () => cancel(), [cancel])

  return { saveNow, cancel }
}
