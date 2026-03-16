import { useEffect } from 'react'

/**
 * useTitle — sets the browser tab title.
 * Automatically appends " — ResumeAI" unless you pass suffix=false.
 *
 * @param {string}  title     - Page-specific title
 * @param {boolean} withBrand - Whether to append " — ResumeAI" (default true)
 */
export function useTitle(title, withBrand = true) {
  useEffect(() => {
    const prev = document.title
    document.title = withBrand && title ? `${title} — ResumeAI` : (title || 'ResumeAI')
    return () => { document.title = prev }
  }, [title, withBrand])
}
