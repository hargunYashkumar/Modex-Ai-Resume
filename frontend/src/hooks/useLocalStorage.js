import { useState, useEffect } from 'react'

/**
 * useLocalStorage — persists state to localStorage.
 * Falls back gracefully if localStorage is unavailable (SSR, private browsing).
 *
 * @param {string} key           - localStorage key
 * @param {*}      initialValue  - default value
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (err) {
      console.warn(`useLocalStorage: could not write key "${key}"`, err)
    }
  }

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (err) {
      console.warn(`useLocalStorage: could not remove key "${key}"`, err)
    }
  }

  return [storedValue, setValue, removeValue]
}
