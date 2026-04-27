/**
 * Advanced mention tracking and notification system
 */

export interface MentionInstance {
  instanceId: string
  username: string
  commentId: string
  mentionedAt: number
  mentionedBy: string
  isResolved: boolean
}

class CommentMentionManager {
  private mentions: Map<string, MentionInstance> = new Map()
  private userMentions: Map<string, MentionInstance[]> = new Map()
  private nextInstanceId = 0

  recordMention(username: string, commentId: string, mentionedBy: string): MentionInstance {
    const instance: MentionInstance = {
      instanceId: `mention-${++this.nextInstanceId}`,
      username,
      commentId,
      mentionedAt: Date.now(),
      mentionedBy,
      isResolved: false
    }

    this.mentions.set(instance.instanceId, instance)

    if (!this.userMentions.has(username)) {
      this.userMentions.set(username, [])
    }
    this.userMentions.get(username)!.push(instance)

    return instance
  }

  getMentionsForUser(username: string): MentionInstance[] {
    return (this.userMentions.get(username) || [])
      .sort((a, b) => b.mentionedAt - a.mentionedAt)
  }

  getUnresolvedMentionsForUser(username: string): MentionInstance[] {
    return this.getMentionsForUser(username).filter(m => !m.isResolved)
  }

  getMentionsInComment(commentId: string): MentionInstance[] {
    return Array.from(this.mentions.values())
      .filter(m => m.commentId === commentId)
      .sort((a, b) => b.mentionedAt - a.mentionedAt)
  }

  resolveMention(instanceId: string): MentionInstance | null {
    const mention = this.mentions.get(instanceId)
    if (mention) {
      mention.isResolved = true
    }
    return mention || null
  }

  resolveAllMentionsForUser(username: string): number {
    const mentions = this.getMentionsForUser(username)
    mentions.forEach(m => {
      m.isResolved = true
    })
    return mentions.length
  }

  getUnresolvedMentionCount(username: string): number {
    return this.getUnresolvedMentionsForUser(username).length
  }

  extractMentions(text: string): string[] {
    const mentions: string[] = []
    const regex = /@(\w+)/g
    let match

    while ((match = regex.exec(text)) !== null) {
      const username = match[1]
      if (!mentions.includes(username)) {
        mentions.push(username)
      }
    }

    return mentions
  }

  getMostMentionedUsers(limit = 10): Array<{username: string, count: number}> {
    const counts = new Map<string, number>()

    this.mentions.forEach(mention => {
      counts.set(mention.username, (counts.get(mention.username) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([username, count]) => ({username, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  getMentionStats(username?: string): {
    totalMentions: number
    unresolvedCount: number
    mentionedByCount: number
  } {
    if (username) {
      const userMentions = this.getMentionsForUser(username)
      const mentioners = new Set(userMentions.map(m => m.mentionedBy))

      return {
        totalMentions: userMentions.length,
        unresolvedCount: userMentions.filter(m => !m.isResolved).length,
        mentionedByCount: mentioners.size
      }
    }

    return {
      totalMentions: this.mentions.size,
      unresolvedCount: Array.from(this.mentions.values()).filter(m => !m.isResolved).length,
      mentionedByCount: new Set(Array.from(this.mentions.values()).map(m => m.mentionedBy)).size
    }
  }

  getRecentMentions(limit = 20): MentionInstance[] {
    return Array.from(this.mentions.values())
      .sort((a, b) => b.mentionedAt - a.mentionedAt)
      .slice(0, limit)
  }

  getUserMentionHistory(username: string): {
    day: string
    count: number
  }[] {
    const userMentions = this.getMentionsForUser(username)
    const history = new Map<string, number>()

    userMentions.forEach(mention => {
      const date = new Date(mention.mentionedAt).toISOString().split('T')[0]
      history.set(date, (history.get(date) || 0) + 1)
    })

    return Array.from(history.entries())
      .map(([day, count]) => ({day, count}))
      .sort((a, b) => a.day.localeCompare(b.day))
  }
}

export const commentMentionManager = new CommentMentionManager()
