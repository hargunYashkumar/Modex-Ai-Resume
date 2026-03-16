import { useState, useEffect } from 'react'

/**
 * useWindowSize — returns current window dimensions.
 * Updates on resize with debounce to avoid excessive re-renders.
 *
 * @returns {{ width: number, height: number, isMobile: boolean, isTablet: boolean }}
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width:    typeof window !== 'undefined' ? window.innerWidth  : 1280,
    height:   typeof window !== 'undefined' ? window.innerHeight : 800,
  })

  useEffect(() => {
    let timer
    const handler = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight })
      }, 150)
    }
    window.addEventListener('resize', handler)
    return () => { window.removeEventListener('resize', handler); clearTimeout(timer) }
  }, [])

  return {
    ...size,
    isMobile:  size.width < 640,
    isTablet:  size.width >= 640 && size.width < 1024,
    isDesktop: size.width >= 1024,
  }
}
