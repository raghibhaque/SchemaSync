import { useEffect } from 'react'

export function useKeyboardShortcuts(actions: {
  onSearchFocus?: () => void
  onEscape?: () => void
  onArrowDown?: () => void
  onArrowUp?: () => void
  onEnter?: () => void
  onSlash?: () => void
  onUndo?: () => void
  onRedo?: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      const isTextArea = e.target instanceof HTMLTextAreaElement

      // Search focus: Ctrl+K or Cmd+K
      if (isMeta && e.key === 'k' && !isInput) {
        e.preventDefault()
        actions.onSearchFocus?.()
      }

      // Search focus: /
      if (e.key === '/' && !isInput) {
        e.preventDefault()
        actions.onSlash?.()
      }

      // Escape
      if (e.key === 'Escape') {
        actions.onEscape?.()
      }

      // Arrow keys (only when not typing in an input)
      if (!isTextArea) {
        if (e.key === 'ArrowDown') {
          actions.onArrowDown?.()
        }
        if (e.key === 'ArrowUp') {
          actions.onArrowUp?.()
        }
      }

      // Enter (when not in textarea, and not typing in an input field that needs enter)
      if (e.key === 'Enter' && !isInput) {
        e.preventDefault()
        actions.onEnter?.()
      }

      // Undo: Ctrl+Z or Cmd+Z
      if (isMeta && e.key === 'z' && !isTextArea) {
        e.preventDefault()
        actions.onUndo?.()
      }

      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y or Cmd+Y
      if ((isMeta && e.shiftKey && e.key === 'z') || (isMeta && e.key === 'y')) {
        e.preventDefault()
        actions.onRedo?.()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [actions])
}
