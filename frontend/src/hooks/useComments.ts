import { useState, useCallback, useMemo } from 'react'
import { commentStore, type CommentTarget } from '../lib/comments'

export function useComments(target_type: CommentTarget, target_id: string) {
  const [, setRefresh] = useState(0)
  const currentUser = 'current-user' // Would come from auth context

  const threads = useMemo(() => {
    return commentStore.getComments(target_type, target_id)
  }, [target_type, target_id])

  const stats = useMemo(() => {
    return commentStore.getStats(target_type, target_id)
  }, [target_type, target_id])

  const refresh = useCallback(() => {
    setRefresh(prev => prev + 1)
  }, [])

  const addComment = useCallback(
    (content: string) => {
      commentStore.addComment(target_type, target_id, currentUser, content)
      refresh()
    },
    [target_type, target_id, currentUser, refresh]
  )

  const addReply = useCallback(
    (parentId: string, content: string) => {
      commentStore.addReply(target_type, target_id, parentId, currentUser, content)
      refresh()
    },
    [target_type, target_id, currentUser, refresh]
  )

  const resolveComment = useCallback(
    (commentId: string) => {
      commentStore.resolveComment(commentId)
      refresh()
    },
    [refresh]
  )

  const addReaction = useCallback(
    (commentId: string, emoji: string) => {
      commentStore.addReaction(commentId, emoji, currentUser)
      refresh()
    },
    [currentUser, refresh]
  )

  const removeReaction = useCallback(
    (commentId: string, emoji: string) => {
      commentStore.removeReaction(commentId, emoji, currentUser)
      refresh()
    },
    [currentUser, refresh]
  )

  const editComment = useCallback(
    (commentId: string, newContent: string) => {
      commentStore.editComment(commentId, newContent)
      refresh()
    },
    [refresh]
  )

  const deleteComment = useCallback(
    (commentId: string) => {
      commentStore.deleteComment(commentId)
      refresh()
    },
    [refresh]
  )

  return {
    threads,
    stats,
    addComment,
    addReply,
    resolveComment,
    addReaction,
    removeReaction,
    editComment,
    deleteComment,
    currentUser,
  }
}
