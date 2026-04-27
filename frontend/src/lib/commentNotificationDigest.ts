/**
 * Notification batching and digest system
 */

export interface DigestSummary {
  summaryId: string
  userId: string
  period: 'hourly' | 'daily' | 'weekly'
  startTime: number
  endTime: number
  mentions: number
  replies: number
  reactions: number
  resolutions: number
  createdAt: number
  isRead: boolean
}

class CommentNotificationDigestManager {
  private digests: Map<string, DigestSummary> = new Map()
  private nextSummaryId = 0

  createDigest(userId: string, period: 'hourly' | 'daily' | 'weekly'): DigestSummary {
    const now = Date.now()
    const periodMs = period === 'hourly' ? 60 * 60 * 1000 : period === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000

    const digest: DigestSummary = {
      summaryId: `digest-${++this.nextSummaryId}`,
      userId,
      period,
      startTime: now - periodMs,
      endTime: now,
      mentions: 0,
      replies: 0,
      reactions: 0,
      resolutions: 0,
      createdAt: now,
      isRead: false
    }

    this.digests.set(digest.summaryId, digest)
    return digest
  }

  addToDigest(summaryId: string, eventType: 'mention' | 'reply' | 'reaction' | 'resolution', count = 1): boolean {
    const digest = this.digests.get(summaryId)
    if (!digest) return false

    switch (eventType) {
      case 'mention':
        digest.mentions += count
        break
      case 'reply':
        digest.replies += count
        break
      case 'reaction':
        digest.reactions += count
        break
      case 'resolution':
        digest.resolutions += count
        break
    }

    return true
  }

  getDigestsForUser(userId: string): DigestSummary[] {
    return Array.from(this.digests.values())
      .filter(d => d.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  markDigestAsRead(summaryId: string): DigestSummary | null {
    const digest = this.digests.get(summaryId)
    if (digest) {
      digest.isRead = true
    }
    return digest || null
  }

  getUnreadDigests(userId: string): DigestSummary[] {
    return this.getDigestsForUser(userId).filter(d => !d.isRead)
  }

  deleteOldDigests(olderThanDays: number): number {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000)
    let count = 0

    const toDelete: string[] = []
    this.digests.forEach((digest, id) => {
      if (digest.createdAt < cutoff) {
        toDelete.push(id)
      }
    })

    toDelete.forEach(id => {
      if (this.digests.delete(id)) count++
    })

    return count
  }

  getDigestStats(summaryId: string): {total: number, breakdown: Record<string, number>} {
    const digest = this.digests.get(summaryId)
    if (!digest) return {total: 0, breakdown: {}}

    const total = digest.mentions + digest.replies + digest.reactions + digest.resolutions

    return {
      total,
      breakdown: {
        mentions: digest.mentions,
        replies: digest.replies,
        reactions: digest.reactions,
        resolutions: digest.resolutions
      }
    }
  }

  getTrendingTopics(userId: string, limit = 5): Array<{type: string, count: number}> {
    const digests = this.getDigestsForUser(userId)
    const totals = {
      mentions: 0,
      replies: 0,
      reactions: 0,
      resolutions: 0
    }

    digests.forEach(d => {
      totals.mentions += d.mentions
      totals.replies += d.replies
      totals.reactions += d.reactions
      totals.resolutions += d.resolutions
    })

    return Object.entries(totals)
      .map(([type, count]) => ({type, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }
}

export const commentNotificationDigestManager = new CommentNotificationDigestManager()
