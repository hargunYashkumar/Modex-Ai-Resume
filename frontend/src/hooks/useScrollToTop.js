import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * useScrollToTop — scrolls the window to the top on every route change.
 *
 * Add once to AppLayout or App.jsx:
 *   function AppLayout() {
 *     useScrollToTop()
 *     return <Outlet />
 *   }
 */
export function useScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
}
