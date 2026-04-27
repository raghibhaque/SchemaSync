import { useCallback } from 'react'
import { commentActivityLogger } from '../lib/commentActivityLog'

export function useCommentActivityLog(commentId: string, actor: string) {
  const log = useCallback((action: string, metadata?: Record<string, any>) => {
    return commentActivityLogger.logActivity(commentId, action, actor, metadata)
  }, [commentId, actor])

  const getLog = useCallback(() => {
    return commentActivityLogger.getActivityLog(commentId)
  }, [commentId])

  return {log, getLog}
}
