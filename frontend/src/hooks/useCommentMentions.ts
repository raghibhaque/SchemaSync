import { useCallback } from 'react'
import { commentMentionManager, type MentionInstance } from '../lib/commentMentions'

export function useCommentMentions(username: string) {
  const getMentions = useCallback((): MentionInstance[] => {
    return commentMentionManager.getMentionsForUser(username)
  }, [username])

  const getUnresolved = useCallback((): MentionInstance[] => {
    return commentMentionManager.getUnresolvedMentionsForUser(username)
  }, [username])

  const getUnresolvedCount = useCallback((): number => {
    return commentMentionManager.getUnresolvedMentionCount(username)
  }, [username])

  const resolveMention = useCallback((instanceId: string) => {
    return commentMentionManager.resolveMention(instanceId)
  }, [])

  const resolveAll = useCallback((): number => {
    return commentMentionManager.resolveAllMentionsForUser(username)
  }, [username])

  const getStats = useCallback(() => {
    return commentMentionManager.getMentionStats(username)
  }, [username])

  const getHistory = useCallback(() => {
    return commentMentionManager.getUserMentionHistory(username)
  }, [username])

  return {
    getMentions,
    getUnresolved,
    getUnresolvedCount,
    resolveMention,
    resolveAll,
    getStats,
    getHistory,
  }
}

export function useCommentMentionManager() {
  const recordMention = useCallback((username: string, commentId: string, mentionedBy: string) => {
    return commentMentionManager.recordMention(username, commentId, mentionedBy)
  }, [])

  const extractMentions = useCallback((text: string) => {
    return commentMentionManager.extractMentions(text)
  }, [])

  const getMostMentioned = useCallback((limit?: number) => {
    return commentMentionManager.getMostMentionedUsers(limit)
  }, [])

  const getRecentMentions = useCallback((limit?: number) => {
    return commentMentionManager.getRecentMentions(limit)
  }, [])

  const getMentionsInComment = useCallback((commentId: string) => {
    return commentMentionManager.getMentionsInComment(commentId)
  }, [])

  return {
    recordMention,
    extractMentions,
    getMostMentioned,
    getRecentMentions,
    getMentionsInComment,
  }
}
