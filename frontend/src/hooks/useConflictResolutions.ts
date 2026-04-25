import { useState, useEffect } from 'react'

export interface ConflictResolution {
  conflictId: string
  status: 'resolved' | 'pending' | 'needs_review'
  notes: string
  suggestedFix?: string
  timestamp: number
}

export function useConflictResolutions(sessionKey: string) {
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map())
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`conflicts:${sessionKey}`)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setResolutions(new Map(Object.entries(data)))
      } catch (e) {
        console.warn('Failed to parse conflict resolutions:', e)
      }
    }
    setIsLoaded(true)
  }, [sessionKey])

  // Save to localStorage whenever resolutions change
  useEffect(() => {
    if (isLoaded) {
      const data = Object.fromEntries(resolutions)
      localStorage.setItem(`conflicts:${sessionKey}`, JSON.stringify(data))
    }
  }, [resolutions, sessionKey, isLoaded])

  const markResolved = (conflictId: string, notes: string = '', suggestedFix?: string) => {
    setResolutions(prev => {
      const next = new Map(prev)
      next.set(conflictId, {
        conflictId,
        status: 'resolved',
        notes,
        suggestedFix,
        timestamp: Date.now(),
      })
      return next
    })
  }

  const markNeedsReview = (conflictId: string, notes: string = '') => {
    setResolutions(prev => {
      const next = new Map(prev)
      next.set(conflictId, {
        conflictId,
        status: 'needs_review',
        notes,
        timestamp: Date.now(),
      })
      return next
    })
  }

  const clearResolution = (conflictId: string) => {
    setResolutions(prev => {
      const next = new Map(prev)
      next.delete(conflictId)
      return next
    })
  }

  const getResolution = (conflictId: string) => resolutions.get(conflictId)

  const getStats = () => {
    const total = resolutions.size
    const resolved = Array.from(resolutions.values()).filter(r => r.status === 'resolved').length
    const needsReview = Array.from(resolutions.values()).filter(r => r.status === 'needs_review').length
    return { total, resolved, needsReview }
  }

  return {
    markResolved,
    markNeedsReview,
    clearResolution,
    getResolution,
    getStats,
    isLoaded,
  }
}
