import { useEffect } from 'react'

/**
 * useTitle — sets the browser tab title.
 * Automatically appends " — Modex" unless you pass suffix=false.
 *
 * @param {string}  title     - Page-specific title
 * @param {boolean} withBrand - Whether to append " — Modex" (default true)
 */
export function useTitle(title, withBrand = true) {
  useEffect(() => {
    const prev = document.title
    document.title = withBrand && title ? `${title} — Modex` : (title || 'Modex')
    return () => { document.title = prev }
  }, [title, withBrand])
}
