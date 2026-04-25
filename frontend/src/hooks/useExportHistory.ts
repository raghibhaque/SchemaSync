import { useState, useEffect } from 'react'

export interface ExportRecord {
  id: string
  timestamp: number
  format: string
  filename: string
  complexity: string
  conflictCount: number
  tableCount: number
}

export function useExportHistory() {
  const [history, setHistory] = useState<ExportRecord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('schemasync:export-history')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setHistory(Array.isArray(data) ? data : [])
      } catch (e) {
        console.warn('Failed to parse export history:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('schemasync:export-history', JSON.stringify(history))
    }
  }, [history, isLoaded])

  const addExport = (record: Omit<ExportRecord, 'id' | 'timestamp'>) => {
    const newRecord: ExportRecord = {
      ...record,
      id: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }
    setHistory(prev => [newRecord, ...prev].slice(0, 10)) // Keep last 10 exports
  }

  const clearHistory = () => {
    setHistory([])
  }

  const getRecent = (count: number = 5) => {
    return history.slice(0, count)
  }

  const deleteRecord = (id: string) => {
    setHistory(prev => prev.filter(r => r.id !== id))
  }

  return {
    history,
    addExport,
    clearHistory,
    deleteRecord,
    getRecent,
    isLoaded,
  }
}
