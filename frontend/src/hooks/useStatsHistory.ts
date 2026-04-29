import { useCallback, useEffect, useState } from 'react'
import type { QuickStats } from '@/types'

const STORAGE_KEY = 'schemasync:stats_history'
const MAX_HISTORY = 20

export interface StatsHistoryEntry {
  timestamp: number
  stats: QuickStats
  label?: string
}

export function useStatsHistory(schemaKey: string) {
  const [history, setHistory] = useState<StatsHistoryEntry[]>([])

  const key = `${STORAGE_KEY}:${schemaKey}`

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored) as StatsHistoryEntry[]
        setHistory(parsed)
      }
    } catch (e) {
      console.error('Failed to load stats history:', e)
    }
  }, [key])

  const recordStats = useCallback((stats: QuickStats, label?: string) => {
    setHistory((prev) => {
      const updated = [
        ...prev,
        {
          timestamp: Date.now(),
          stats,
          label,
        },
      ]
      // Keep only the last MAX_HISTORY entries
      if (updated.length > MAX_HISTORY) {
        updated.shift()
      }
      try {
        localStorage.setItem(key, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save stats history:', e)
      }
      return updated
    })
  }, [key])

  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error('Failed to clear stats history:', e)
    }
  }, [key])

  const getTrend = useCallback((metric: keyof QuickStats): 'up' | 'down' | 'flat' | null => {
    if (history.length < 2) return null

    const prev = history[history.length - 2].stats[metric]
    const curr = history[history.length - 1].stats[metric]

    if (typeof prev !== 'number' || typeof curr !== 'number') return null

    if (curr > prev) return 'up'
    if (curr < prev) return 'down'
    return 'flat'
  }, [history])

  const getChange = useCallback(
    (metric: keyof QuickStats): number | null => {
      if (history.length < 2) return null

      const prev = history[history.length - 2].stats[metric]
      const curr = history[history.length - 1].stats[metric]

      if (typeof prev !== 'number' || typeof curr !== 'number') return null

      return curr - prev
    },
    [history]
  )

  return {
    history,
    recordStats,
    clearHistory,
    getTrend,
    getChange,
    lastEntry: history.length > 0 ? history[history.length - 1] : null,
  }
}
