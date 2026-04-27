import { useEffect, useCallback } from 'react'
import { commentNotificationIntegration } from '../lib/commentNotifications'
import type { Comment } from '../lib/comments'

type EventListener = (comment: Comment, extra?: Record<string, any>) => void

export function useCommentNotifications() {
  const onCommentAdded = useCallback((listener: EventListener) => {
    return commentNotificationIntegration.registerOnCommentAdded(listener)
  }, [])

  const onReplyAdded = useCallback((listener: EventListener) => {
    return commentNotificationIntegration.registerOnReplyAdded(listener)
  }, [])

  const onCommentResolved = useCallback((listener: EventListener) => {
    return commentNotificationIntegration.registerOnCommentResolved(listener)
  }, [])

  return {
    onCommentAdded,
    onReplyAdded,
    onCommentResolved,
  }
}

export function useOnCommentAdded(listener: EventListener) {
  useEffect(() => {
    return commentNotificationIntegration.registerOnCommentAdded(listener)
  }, [listener])
}

export function useOnReplyAdded(listener: EventListener) {
  useEffect(() => {
    return commentNotificationIntegration.registerOnReplyAdded(listener)
  }, [listener])
}

export function useOnCommentResolved(listener: EventListener) {
  useEffect(() => {
    return commentNotificationIntegration.registerOnCommentResolved(listener)
  }, [listener])
}
