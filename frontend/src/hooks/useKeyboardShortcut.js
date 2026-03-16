import { useEffect, useCallback } from 'react'

/**
 * useKeyboardShortcut — registers a keyboard shortcut.
 *
 * @param {string[]} keys    - Key combo, e.g. ['Meta', 's'] or ['ctrl', 's']
 * @param {Function} handler - Callback to fire
 * @param {object}   options - { preventDefault: true, enabled: true }
 *
 * Examples:
 *   useKeyboardShortcut(['Meta', 's'], () => save())       // Cmd+S (Mac)
 *   useKeyboardShortcut(['Control', 's'], () => save())    // Ctrl+S (Win/Linux)
 *   useKeyboardShortcut(['Escape'], () => closeModal())
 */
export function useKeyboardShortcut(keys, handler, options = {}) {
  const { preventDefault = true, enabled = true } = options

  const handleKey = useCallback((e) => {
    if (!enabled) return
    const pressed = keys.every(key => {
      if (key === 'Meta')    return e.metaKey
      if (key === 'Control') return e.ctrlKey
      if (key === 'Alt')     return e.altKey
      if (key === 'Shift')   return e.shiftKey
      return e.key === key || e.key.toLowerCase() === key.toLowerCase()
    })
    if (pressed) {
      if (preventDefault) e.preventDefault()
      handler(e)
    }
  }, [keys, handler, preventDefault, enabled])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])
}

/**
 * useBuilderShortcuts — wires up all resume builder keyboard shortcuts.
 * Call once at the top of ResumeBuilder.
 *
 * @param {{ onSave, onTogglePreview, onSwitchPanel }} handlers
 */
export function useBuilderShortcuts({ onSave, onTogglePreview, onSwitchPanel }) {
  // Cmd/Ctrl + S → Save
  useKeyboardShortcut(['Meta',    's'], onSave,          { preventDefault: true })
  useKeyboardShortcut(['Control', 's'], onSave,          { preventDefault: true })
  // Cmd/Ctrl + P → Toggle preview
  useKeyboardShortcut(['Meta',    'p'], onTogglePreview, { preventDefault: true })
  useKeyboardShortcut(['Control', 'p'], onTogglePreview, { preventDefault: true })
  // Number keys 1-5 → Switch panel tabs (when not in an input)
  useKeyboardShortcut(['1'], () => onSwitchPanel('editor'),    { preventDefault: false })
  useKeyboardShortcut(['2'], () => onSwitchPanel('templates'), { preventDefault: false })
  useKeyboardShortcut(['3'], () => onSwitchPanel('customise'), { preventDefault: false })
  useKeyboardShortcut(['4'], () => onSwitchPanel('ai'),        { preventDefault: false })
  useKeyboardShortcut(['5'], () => onSwitchPanel('export'),    { preventDefault: false })
}
