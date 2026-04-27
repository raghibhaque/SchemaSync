export interface ActivityEntry {
  entryId: string
  commentId: string
  action: string
  actor: string
  timestamp: number
  metadata?: Record<string, any>
}

class CommentActivityLogger {
  private log: Map<string, ActivityEntry> = new Map()
  private nextEntryId = 0

  logActivity(commentId: string, action: string, actor: string, metadata?: Record<string, any>): ActivityEntry {
    const entry: ActivityEntry = {
      entryId: `entry-${++this.nextEntryId}`,
      commentId,
      action,
      actor,
      timestamp: Date.now(),
      metadata
    }
    this.log.set(entry.entryId, entry)
    return entry
  }

  getActivityLog(commentId: string): ActivityEntry[] {
    return Array.from(this.log.values())
      .filter(e => e.commentId === commentId)
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  getActivitiesByActor(actor: string): ActivityEntry[] {
    return Array.from(this.log.values())
      .filter(e => e.actor === actor)
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  getRecentActivities(limit = 50): ActivityEntry[] {
    return Array.from(this.log.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }
}

export const commentActivityLogger = new CommentActivityLogger()
