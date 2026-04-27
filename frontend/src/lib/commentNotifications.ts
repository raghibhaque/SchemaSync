/**
 * Integration layer between comment system and notifications
 * Automatically triggers notifications for comment events
 */

import { notificationManager } from './notifications'
import type { Comment } from './comments'

type EventListener = (comment: Comment, extra?: Record<string, any>) => void

class CommentNotificationIntegration {
  private onCommentAddedListeners: EventListener[] = []
  private onReplyAddedListeners: EventListener[] = []
  private onCommentResolvedListeners: EventListener[] = []

  registerOnCommentAdded(listener: EventListener): () => void {
    this.onCommentAddedListeners.push(listener)
    return () => {
      this.onCommentAddedListeners = this.onCommentAddedListeners.filter(l => l !== listener)
    }
  }

  registerOnReplyAdded(listener: EventListener): () => void {
    this.onReplyAddedListeners.push(listener)
    return () => {
      this.onReplyAddedListeners = this.onReplyAddedListeners.filter(l => l !== listener)
    }
  }

  registerOnCommentResolved(listener: EventListener): () => void {
    this.onCommentResolvedListeners.push(listener)
    return () => {
      this.onCommentResolvedListeners = this.onCommentResolvedListeners.filter(l => l !== listener)
    }
  }

  notifyCommentAdded(comment: Comment, targetAuthor?: string): void {
    this.onCommentAddedListeners.forEach(listener => listener(comment, { targetAuthor }))

    // Create mention notifications for @-mentioned users
    comment.mentions.forEach(mentionedUser => {
      if (mentionedUser !== comment.author) {
        notificationManager.addNotification(
          'mention',
          comment.author,
          comment.id,
          comment.target_type,
          comment.target_id,
          comment.content
        )
      }
    })
  }

  notifyReplyAdded(reply: Comment, parentComment: Comment): void {
    this.onReplyAddedListeners.forEach(listener => listener(reply, { parentComment }))

    // Notify the parent comment author that someone replied
    if (reply.author !== parentComment.author) {
      notificationManager.addNotification(
        'reply',
        reply.author,
        reply.id,
        reply.target_type,
        reply.target_id,
        reply.content
      )
    }

    // Create mention notifications for @-mentioned users
    reply.mentions.forEach(mentionedUser => {
      if (mentionedUser !== reply.author && mentionedUser !== parentComment.author) {
        notificationManager.addNotification(
          'mention',
          reply.author,
          reply.id,
          reply.target_type,
          reply.target_id,
          reply.content
        )
      }
    })
  }

  notifyCommentResolved(comment: Comment, resolvedBy: string): void {
    this.onCommentResolvedListeners.forEach(listener => listener(comment, { resolvedBy }))

    // Notify the comment author that their comment was resolved
    if (comment.author !== resolvedBy) {
      notificationManager.addNotification(
        'resolve',
        resolvedBy,
        comment.id,
        comment.target_type,
        comment.target_id,
        comment.content
      )
    }
  }

  notifyReactionAdded(comment: Comment, emoji: string, user: string): void {
    // Only notify if someone else reacted
    if (comment.author !== user) {
      notificationManager.addNotification(
        'reaction',
        user,
        comment.id,
        comment.target_type,
        comment.target_id,
        `${emoji} ${comment.content.substring(0, 50)}`
      )
    }
  }
}

export const commentNotificationIntegration = new CommentNotificationIntegration()
