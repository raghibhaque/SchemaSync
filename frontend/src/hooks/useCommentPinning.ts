import { useCallback } from 'react'
import { commentPinningManager, type PinPriority, type PinnedComment } from '../lib/commentPinning'

export function useCommentPinning(commentId: string, currentUserId: string) {
  const pin = useCallback((priority: PinPriority = 'medium', reason?: string, expiresAt?: number) => {
    return commentPinningManager.pinComment(commentId, priority, currentUserId, reason, expiresAt)
  }, [commentId, currentUserId])

  const unpin = useCallback(() => {
    return commentPinningManager.unpinCommentById(commentId)
  }, [commentId])

  const isPinned = useCallback((): boolean => {
    return commentPinningManager.isPinned(commentId)
  }, [commentId])

  const getPins = useCallback((): PinnedComment[] => {
    return commentPinningManager.getPinnedByCommentId(commentId)
  }, [commentId])

  return {
    pin,
    unpin,
    isPinned,
    getPins,
  }
}

export function usePinningManager() {
  const getActivelyPinned = useCallback((): PinnedComment[] => {
    return commentPinningManager.getActivelyPinnedComments()
  }, [])

  const getPinnedByPriority = useCallback((priority: PinPriority) => {
    return commentPinningManager.getPinnedCommentsByPriority(priority)
  }, [])

  const updatePriority = useCallback((pinnedId: string, newPriority: PinPriority) => {
    return commentPinningManager.updatePriority(pinnedId, newPriority)
  }, [])

  const extendExpiry = useCallback((pinnedId: string, newTime: number) => {
    return commentPinningManager.extendExpiry(pinnedId, newTime)
  }, [])

  const getStats = useCallback(() => {
    return commentPinningManager.getPinnedStats()
  }, [])

  const getExpired = useCallback(() => {
    return commentPinningManager.getExpiredPins()
  }, [])

  const cleanupExpired = useCallback(() => {
    return commentPinningManager.cleanupExpiredPins()
  }, [])

  const getPinsByUser = useCallback((userId: string) => {
    return commentPinningManager.getPinsByUser(userId)
  }, [])

  return {
    getActivelyPinned,
    getPinnedByPriority,
    updatePriority,
    extendExpiry,
    getStats,
    getExpired,
    cleanupExpired,
    getPinsByUser,
  }
}
