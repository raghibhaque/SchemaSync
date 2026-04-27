/**
 * Comment Management System
 * Handles comments on mappings, conflicts, and suggestions
 */

export type CommentTarget = 'mapping' | 'conflict' | 'suggestion' | 'column'

export interface Comment {
  id: string
  target_type: CommentTarget
  target_id: string
  author: string
  author_avatar?: string
  content: string
  created_at: number
  updated_at: number
  is_resolved: boolean
  reply_to?: string
  reactions: Record<string, string[]>
  mentions: string[]
}

export interface CommentThread {
  root: Comment
  replies: Comment[]
}

/**
 * In-memory comment store (would be backend API in production)
 */
class CommentStore {
  private comments: Map<string, Comment> = new Map()
  private nextId = 0

  addComment(target_type: CommentTarget, target_id: string, author: string, content: string): Comment {
    const id = `comment-${++this.nextId}`
    const now = Date.now()

    const mentions = this.extractMentions(content)
    const comment: Comment = {
      id,
      target_type,
      target_id,
      author,
      content,
      created_at: now,
      updated_at: now,
      is_resolved: false,
      reactions: {},
      mentions,
    }

    this.comments.set(id, comment)
    return comment
  }

  addReply(target_type: CommentTarget, target_id: string, parent_id: string, author: string, content: string): Comment {
    const comment = this.addComment(target_type, target_id, author, content)
    comment.reply_to = parent_id
    return comment
  }

  getComments(target_type: CommentTarget, target_id: string): CommentThread[] {
    const targetComments = Array.from(this.comments.values()).filter(
      c => c.target_type === target_type && c.target_id === target_id
    )

    const threads: CommentThread[] = []
    const roots = targetComments.filter(c => !c.reply_to)

    for (const root of roots) {
      const replies = targetComments.filter(c => c.reply_to === root.id)
      threads.push({ root, replies })
    }

    return threads
  }

  resolveComment(commentId: string): Comment | null {
    const comment = this.comments.get(commentId)
    if (comment) {
      comment.is_resolved = true
      comment.updated_at = Date.now()
    }
    return comment || null
  }

  addReaction(commentId: string, emoji: string, user: string): Comment | null {
    const comment = this.comments.get(commentId)
    if (comment) {
      if (!comment.reactions[emoji]) {
        comment.reactions[emoji] = []
      }
      if (!comment.reactions[emoji].includes(user)) {
        comment.reactions[emoji].push(user)
      }
      comment.updated_at = Date.now()
    }
    return comment || null
  }

  removeReaction(commentId: string, emoji: string, user: string): Comment | null {
    const comment = this.comments.get(commentId)
    if (comment && comment.reactions[emoji]) {
      comment.reactions[emoji] = comment.reactions[emoji].filter(u => u !== user)
      if (comment.reactions[emoji].length === 0) {
        delete comment.reactions[emoji]
      }
      comment.updated_at = Date.now()
    }
    return comment || null
  }

  editComment(commentId: string, newContent: string): Comment | null {
    const comment = this.comments.get(commentId)
    if (comment) {
      comment.content = newContent
      comment.updated_at = Date.now()
      comment.mentions = this.extractMentions(newContent)
    }
    return comment || null
  }

  deleteComment(commentId: string): boolean {
    return this.comments.delete(commentId)
  }

  private extractMentions(content: string): string[] {
    const mentions: string[] = []
    const mentionRegex = /@(\w+)/g
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  getStats(target_type: CommentTarget, target_id: string) {
    const threads = this.getComments(target_type, target_id)
    const total = threads.reduce((sum, t) => sum + 1 + t.replies.length, 0)
    const resolved = threads.filter(t => t.root.is_resolved).length

    return { total, resolved, threads: threads.length }
  }
}

export const commentStore = new CommentStore()
