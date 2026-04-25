import { useState, useEffect } from 'react'

export interface HistoryEntry {
  id: string
  timestamp: number
  actionType: 'reviewed' | 'unreviewed' | 'expanded' | 'collapsed' | 'template_loaded' | 'suggestion_accepted'
  mappingId: string
  tableName: string
  previousValue?: any
  newValue?: any
  description: string
}

const HISTORY_STORAGE_KEY = 'schemasync:history'

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
