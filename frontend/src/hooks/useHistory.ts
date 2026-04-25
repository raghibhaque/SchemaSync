import { useState, useEffect, useCallback, useMemo } from 'react'

export interface HistoryEntry {
  id: string
  timestamp: number
  actionType: 'reviewed' | 'unreviewed' | 'expanded' | 'collapsed' | 'template_loaded' | 'suggestion_accepted' | 'undo' | 'redo'
  mappingId: string
  tableName: string
  previousValue?: any
  newValue?: any
  description: string
}

export interface UndoRedoState<T> {
  entries: T[]
  currentIndex: number
}

const HISTORY_STORAGE_KEY = 'schemahub:history'
const UNDO_REDO_KEY = 'schemahub:undoredo'
const MAX_UNDO_STACK = 50

export function useHistory(reconciliationHash: string) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const storageKey = `${HISTORY_STORAGE_KEY}:${reconciliationHash}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const entries = JSON.parse(stored) as HistoryEntry[]
        setHistory(entries)
      } catch (e) {
        console.warn('Failed to parse stored history:', e)
      }
    }
    setIsLoaded(true)
  }, [reconciliationHash])

  const addEntry = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    }

    setHistory((prev) => {
      const updated = [newEntry, ...prev]
      const storageKey = `${HISTORY_STORAGE_KEY}:${reconciliationHash}`
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }

  const clearHistory = () => {
    setHistory([])
    const storageKey = `${HISTORY_STORAGE_KEY}:${reconciliationHash}`
    localStorage.removeItem(storageKey)
  }

  return {
    history,
    isLoaded,
    addEntry,
    clearHistory,
  }
}

// Advanced undo/redo hook for state management
export function useUndoRedo<T>(initialState: T) {
  const [undoRedo, setUndoRedo] = useState<UndoRedoState<T>>({
    entries: [structuredClone(initialState)],
    currentIndex: 0,
  })

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UNDO_REDO_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as UndoRedoState<T>
        setUndoRedo(parsed)
      }
    } catch (error) {
      console.warn('Failed to load undo/redo state:', error)
    }
  }, [])

  // Save to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(UNDO_REDO_KEY, JSON.stringify(undoRedo))
    } catch (error) {
      console.warn('Failed to save undo/redo state:', error)
    }
  }, [undoRedo])

  const push = useCallback((newState: T) => {
    setUndoRedo(prev => {
      // Trim future states if we're not at the end
      const trimmed = prev.entries.slice(0, prev.currentIndex + 1)
      
      // Add new state
      trimmed.push(structuredClone(newState))
      
      // Keep within limit
      if (trimmed.length > MAX_UNDO_STACK) {
        trimmed.shift()
      }

      return {
        entries: trimmed,
        currentIndex: trimmed.length - 1,
      }
    })
  }, [])

  const undo = useCallback(() => {
    setUndoRedo(prev => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }))
  }, [])

  const redo = useCallback(() => {
    setUndoRedo(prev => ({
      ...prev,
      currentIndex: Math.min(prev.entries.length - 1, prev.currentIndex + 1),
    }))
  }, [])

  const goToState = useCallback((index: number) => {
    setUndoRedo(prev => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(prev.entries.length - 1, index)),
    }))
  }, [])

  const clear = useCallback(() => {
    setUndoRedo({
      entries: [structuredClone(initialState)],
      currentIndex: 0,
    })
  }, [initialState])

  const currentState = useMemo(
    () => undoRedo.entries[undoRedo.currentIndex] || initialState,
    [undoRedo, initialState]
  )

  const canUndo = undoRedo.currentIndex > 0
  const canRedo = undoRedo.currentIndex < undoRedo.entries.length - 1

  return {
    state: currentState,
    push,
    undo,
    redo,
    goToState,
    clear,
    canUndo,
    canRedo,
    currentIndex: undoRedo.currentIndex,
    totalSteps: undoRedo.entries.length,
  }
}
