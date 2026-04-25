import { useState, useEffect } from 'react'

export interface MappingNote {
  mappingId: string
  text: string
  timestamp: number
  author?: string
}

export function useMappingNotes(sessionKey: string) {
  const [notes, setNotes] = useState<Map<string, MappingNote>>(new Map())
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`notes:${sessionKey}`)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setNotes(new Map(Object.entries(data)))
      } catch (e) {
        console.warn('Failed to parse mapping notes:', e)
      }
    }
    setIsLoaded(true)
  }, [sessionKey])

  // Save to localStorage whenever notes change
  useEffect(() => {
    if (isLoaded) {
      const data = Object.fromEntries(notes)
      localStorage.setItem(`notes:${sessionKey}`, JSON.stringify(data))
    }
  }, [notes, sessionKey, isLoaded])

  const addNote = (mappingId: string, text: string, author?: string) => {
    setNotes(prev => {
      const next = new Map(prev)
      next.set(mappingId, {
        mappingId,
        text,
        author,
        timestamp: Date.now(),
      })
      return next
    })
  }

  const updateNote = (mappingId: string, text: string) => {
    setNotes(prev => {
      const next = new Map(prev)
      const existing = next.get(mappingId)
      if (existing) {
        next.set(mappingId, {
          ...existing,
          text,
          timestamp: Date.now(),
        })
      }
      return next
    })
  }

  const deleteNote = (mappingId: string) => {
    setNotes(prev => {
      const next = new Map(prev)
      next.delete(mappingId)
      return next
    })
  }

  const getNote = (mappingId: string) => notes.get(mappingId)

  const hasNote = (mappingId: string) => notes.has(mappingId)

  const getNoteCount = () => notes.size

  return {
    addNote,
    updateNote,
    deleteNote,
    getNote,
    hasNote,
    getNoteCount,
    isLoaded,
  }
}
