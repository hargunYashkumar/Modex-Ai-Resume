import { useState, useEffect } from 'react'

/**
 * Delays updating a value until `delay` ms have passed since the last change.
 * Use this to avoid spamming API calls on every keystroke.
 *
 * @param {*}      value  - The value to debounce
 * @param {number} delay  - Delay in milliseconds (default 400ms)
 * @returns Debounced value
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
