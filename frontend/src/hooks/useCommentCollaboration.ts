import { useCallback } from 'react'
import { commentCollaborationTracker } from '../lib/commentCollaboration'

export function useCommentCollaboration(commentId: string) {
  const getCollaborators = useCallback(() => commentCollaborationTracker.getCollaborators(commentId), [commentId])
  const getCount = useCallback(() => commentCollaborationTracker.getCollaborationCount(commentId), [commentId])
  return {getCollaborators, getCount}
}
