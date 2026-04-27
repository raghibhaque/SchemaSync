import { useState, useCallback, useMemo } from 'react'
import { commentStore, type CommentTarget } from '../lib/comments'
import { commentNotificationIntegration } from '../lib/commentNotifications'

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
      const comment = commentStore.addComment(target_type, target_id, currentUser, content)
      commentNotificationIntegration.notifyCommentAdded(comment)
      refresh()
    },
    [target_type, target_id, currentUser, refresh]
  )

  const addReply = useCallback(
    (parentId: string, content: string) => {
      const reply = commentStore.addReply(target_type, target_id, parentId, currentUser, content)
      const parentComment = Array.from(commentStore.getComments(target_type, target_id))
        .flatMap(thread => [thread.root, ...thread.replies])
        .find(c => c.id === parentId)

      if (parentComment) {
        commentNotificationIntegration.notifyReplyAdded(reply, parentComment)
      }
      refresh()
    },
    [target_type, target_id, currentUser, refresh]
  )

  const resolveComment = useCallback(
    (commentId: string) => {
      commentStore.resolveComment(commentId)
      const allComments = Array.from(commentStore.getComments(target_type, target_id))
        .flatMap(thread => [thread.root, ...thread.replies])
      const resolvedComment = allComments.find(c => c.id === commentId)

      if (resolvedComment) {
        commentNotificationIntegration.notifyCommentResolved(resolvedComment, currentUser)
      }
      refresh()
    },
    [target_type, target_id, currentUser, refresh]
  )

  const addReaction = useCallback(
    (commentId: string, emoji: string) => {
      const result = commentStore.addReaction(commentId, emoji, currentUser)
      if (result) {
        commentNotificationIntegration.notifyReactionAdded(result, emoji, currentUser)
      }
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
