import { useCallback } from 'react'
import { commentNotificationDigestManager } from '../lib/commentNotificationDigest'

export function useNotificationDigest(userId: string) {
  const createDigest = useCallback((period: 'hourly' | 'daily' | 'weekly') => {
    return commentNotificationDigestManager.createDigest(userId, period)
  }, [userId])

  const getMyDigests = useCallback(() => {
    return commentNotificationDigestManager.getDigestsForUser(userId)
  }, [userId])

  const getUnread = useCallback(() => {
    return commentNotificationDigestManager.getUnreadDigests(userId)
  }, [userId])

  const markAsRead = useCallback((summaryId: string) => {
    return commentNotificationDigestManager.markDigestAsRead(summaryId)
  }, [])

  const getStats = useCallback((summaryId: string) => {
    return commentNotificationDigestManager.getDigestStats(summaryId)
  }, [])

  const getTrending = useCallback((limit?: number) => {
    return commentNotificationDigestManager.getTrendingTopics(userId, limit)
  }, [userId])

  return {
    createDigest,
    getMyDigests,
    getUnread,
    markAsRead,
    getStats,
    getTrending,
  }
}
