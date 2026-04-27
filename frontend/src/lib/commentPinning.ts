/**
 * Comment pinning and priority system
 */

export type PinPriority = 'high' | 'medium' | 'low'

export interface PinnedComment {
  pinnedId: string
  commentId: string
  priority: PinPriority
  pinnedAt: number
  pinnedBy: string
  reason?: string
  expiresAt?: number
}

class CommentPinningManager {
  private pinnedComments: Map<string, PinnedComment> = new Map()
  private nextPinnedId = 0

  pinComment(commentId: string, priority: PinPriority, pinnedBy: string, reason?: string, expiresAt?: number): PinnedComment {
    const pinnedComment: PinnedComment = {
      pinnedId: `pin-${++this.nextPinnedId}`,
      commentId,
      priority,
      pinnedAt: Date.now(),
      pinnedBy,
      reason,
      expiresAt
    }

    this.pinnedComments.set(pinnedComment.pinnedId, pinnedComment)
    return pinnedComment
  }

  unpinComment(pinnedId: string): boolean {
    return this.pinnedComments.delete(pinnedId)
  }

  unpinCommentById(commentId: string): number {
    let count = 0
    const toDelete: string[] = []

    this.pinnedComments.forEach((pin, pinnedId) => {
      if (pin.commentId === commentId) {
        toDelete.push(pinnedId)
      }
    })

    toDelete.forEach(pinnedId => {
      this.pinnedComments.delete(pinnedId)
      count++
    })

    return count
  }

  getActivelyPinnedComments(): PinnedComment[] {
    const now = Date.now()
    return Array.from(this.pinnedComments.values())
      .filter(pin => !pin.expiresAt || pin.expiresAt > now)
      .sort((a, b) => {
        const priorityOrder: Record<PinPriority, number> = {high: 3, medium: 2, low: 1}
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0) || b.pinnedAt - a.pinnedAt
      })
  }

  getPinnedByCommentId(commentId: string): PinnedComment[] {
    return Array.from(this.pinnedComments.values())
      .filter(pin => pin.commentId === commentId)
  }

  isPinned(commentId: string): boolean {
    const pins = this.getPinnedByCommentId(commentId)
    const now = Date.now()
    return pins.some(pin => !pin.expiresAt || pin.expiresAt > now)
  }

  getPinnedCommentsByPriority(priority: PinPriority): PinnedComment[] {
    return Array.from(this.pinnedComments.values())
      .filter(pin => pin.priority === priority)
      .sort((a, b) => b.pinnedAt - a.pinnedAt)
  }

  updatePriority(pinnedId: string, newPriority: PinPriority): PinnedComment | null {
    const pin = this.pinnedComments.get(pinnedId)
    if (pin) {
      pin.priority = newPriority
    }
    return pin || null
  }

  extendExpiry(pinnedId: string, newExpiryTime: number): PinnedComment | null {
    const pin = this.pinnedComments.get(pinnedId)
    if (pin) {
      pin.expiresAt = newExpiryTime
    }
    return pin || null
  }

  getExpiredPins(): PinnedComment[] {
    const now = Date.now()
    return Array.from(this.pinnedComments.values())
      .filter(pin => pin.expiresAt && pin.expiresAt <= now)
  }

  cleanupExpiredPins(): number {
    const expired = this.getExpiredPins()
    let count = 0
    expired.forEach(pin => {
      if (this.pinnedComments.delete(pin.pinnedId)) {
        count++
      }
    })
    return count
  }

  getPinnedStats(): {
    totalPinned: number
    byPriority: Record<PinPriority, number>
    expiringCount: number
    expiredCount: number
  } {
    const now = Date.now()
    let expiringCount = 0
    let expiredCount = 0
    const byPriority: Record<PinPriority, number> = {high: 0, medium: 0, low: 0}

    this.pinnedComments.forEach(pin => {
      byPriority[pin.priority]++

      if (pin.expiresAt) {
        if (pin.expiresAt <= now) {
          expiredCount++
        } else if (pin.expiresAt - now < 24 * 60 * 60 * 1000) {
          expiringCount++
        }
      }
    })

    return {
      totalPinned: this.pinnedComments.size,
      byPriority,
      expiringCount,
      expiredCount
    }
  }

  getPinsByUser(userId: string): PinnedComment[] {
    return Array.from(this.pinnedComments.values())
      .filter(pin => pin.pinnedBy === userId)
      .sort((a, b) => b.pinnedAt - a.pinnedAt)
  }
}

export const commentPinningManager = new CommentPinningManager()
