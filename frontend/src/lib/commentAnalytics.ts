/**
 * Comment analytics and metrics system
 */

import type { CommentThread, Comment } from './comments'

export interface CommentMetrics {
  totalComments: number
  resolvedCount: number
  unresolvedCount: number
  resolutionRate: number
  averageReplyLength: number
  mostUsedReaction: string | null
  averageReactionsPerComment: number
  commentTrendByDay: Map<string, number>
  commentTrendByHour: Map<number, number>
  authorActivityMap: Map<string, {comments: number, reactions: number, resolutions: number}>
  avgTimeToResolution: number
}

class CommentAnalyticsEngine {
  calculateMetrics(threads: CommentThread[]): CommentMetrics {
    const allComments = this.flattenThreads(threads)

    return {
      totalComments: allComments.length,
      resolvedCount: allComments.filter(c => c.is_resolved).length,
      unresolvedCount: allComments.filter(c => !c.is_resolved).length,
      resolutionRate: this.calculateResolutionRate(allComments),
      averageReplyLength: this.calculateAverageReplyLength(threads),
      mostUsedReaction: this.getMostUsedReaction(allComments),
      averageReactionsPerComment: this.calculateAverageReactions(allComments),
      commentTrendByDay: this.getCommentTrendByDay(allComments),
      commentTrendByHour: this.getCommentTrendByHour(allComments),
      authorActivityMap: this.getAuthorActivity(threads),
      avgTimeToResolution: this.calculateAvgTimeToResolution(allComments),
    }
  }

  private flattenThreads(threads: CommentThread[]): Comment[] {
    const comments: Comment[] = []
    threads.forEach(thread => {
      comments.push(thread.root, ...thread.replies)
    })
    return comments
  }

  private calculateResolutionRate(comments: Comment[]): number {
    if (comments.length === 0) return 0
    const resolved = comments.filter(c => c.is_resolved).length
    return (resolved / comments.length) * 100
  }

  private calculateAverageReplyLength(threads: CommentThread[]): number {
    let totalLength = 0
    let replyCount = 0

    threads.forEach(thread => {
      thread.replies.forEach(reply => {
        totalLength += reply.content.length
        replyCount++
      })
    })

    return replyCount > 0 ? totalLength / replyCount : 0
  }

  private getMostUsedReaction(comments: Comment[]): string | null {
    const reactionCounts = new Map<string, number>()

    comments.forEach(comment => {
      Object.entries(comment.reactions).forEach(([emoji, users]) => {
        reactionCounts.set(emoji, (reactionCounts.get(emoji) || 0) + users.length)
      })
    })

    if (reactionCounts.size === 0) return null

    return Array.from(reactionCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0]
  }

  private calculateAverageReactions(comments: Comment[]): number {
    if (comments.length === 0) return 0

    const totalReactions = comments.reduce((sum, comment) => {
      return sum + Object.values(comment.reactions).reduce((s, users) => s + users.length, 0)
    }, 0)

    return totalReactions / comments.length
  }

  private getCommentTrendByDay(comments: Comment[]): Map<string, number> {
    const trend = new Map<string, number>()

    comments.forEach(comment => {
      const date = new Date(comment.created_at).toISOString().split('T')[0]
      trend.set(date, (trend.get(date) || 0) + 1)
    })

    return trend
  }

  private getCommentTrendByHour(comments: Comment[]): Map<number, number> {
    const trend = new Map<number, number>()

    comments.forEach(comment => {
      const hour = new Date(comment.created_at).getHours()
      trend.set(hour, (trend.get(hour) || 0) + 1)
    })

    return trend
  }

  private getAuthorActivity(threads: CommentThread[]): Map<string, {comments: number, reactions: number, resolutions: number}> {
    const activity = new Map<string, {comments: number, reactions: number, resolutions: number}>()

    threads.forEach(thread => {
      const updateActivity = (author: string, comment: Comment) => {
        const current = activity.get(author) || {comments: 0, reactions: 0, resolutions: 0}
        current.comments++
        Object.values(comment.reactions).forEach(users => {
          current.reactions += users.length
        })
        if (comment.is_resolved) {
          current.resolutions++
        }
        activity.set(author, current)
      }

      updateActivity(thread.root.author, thread.root)
      thread.replies.forEach(reply => updateActivity(reply.author, reply))
    })

    return activity
  }

  private calculateAvgTimeToResolution(comments: Comment[]): number {
    const resolvedComments = comments.filter(c => c.is_resolved)
    if (resolvedComments.length === 0) return 0

    const totalTime = resolvedComments.reduce((sum, comment) => {
      return sum + (comment.updated_at - comment.created_at)
    }, 0)

    return totalTime / resolvedComments.length / (1000 * 60) // Convert to minutes
  }

  getTopAuthors(threads: CommentThread[], limit = 10): Array<{author: string, commentCount: number}> {
    const activityMap = this.getAuthorActivity(threads)
    return Array.from(activityMap.entries())
      .map(([author, data]) => ({author, commentCount: data.comments}))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, limit)
  }

  getEngagementScore(threads: CommentThread[]): number {
    if (threads.length === 0) return 0

    const metrics = this.calculateMetrics(threads)
    let score = 0

    score += metrics.totalComments * 0.5
    score += metrics.averageReactionsPerComment * 10
    score += metrics.resolutionRate * 0.1
    score += metrics.averageReplyLength / 100

    return Math.min(100, score)
  }

  getHealthScore(threads: CommentThread[]): number {
    const metrics = this.calculateMetrics(threads)

    let score = 100

    // Deduct for unresolved comments
    score -= Math.min(20, (metrics.unresolvedCount / metrics.totalComments) * 30)

    // Deduct for low engagement
    if (metrics.averageReactionsPerComment < 0.5) {
      score -= 10
    }

    // Bonus for good resolution rate
    if (metrics.resolutionRate > 80) {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  comparePeriods(
    threadsBefore: CommentThread[],
    threadsAfter: CommentThread[]
  ): {
    commentGrowth: number
    resolutionRateChange: number
    engagementChange: number
  } {
    const metricsBefore = this.calculateMetrics(threadsBefore)
    const metricsAfter = this.calculateMetrics(threadsAfter)

    const commentGrowth = metricsBefore.totalComments > 0
      ? ((metricsAfter.totalComments - metricsBefore.totalComments) / metricsBefore.totalComments) * 100
      : 0

    const resolutionRateChange = metricsAfter.resolutionRate - metricsBefore.resolutionRate

    const engagementBefore = this.getEngagementScore(threadsBefore)
    const engagementAfter = this.getEngagementScore(threadsAfter)
    const engagementChange = engagementAfter - engagementBefore

    return {
      commentGrowth,
      resolutionRateChange,
      engagementChange,
    }
  }
}

export const commentAnalyticsEngine = new CommentAnalyticsEngine()
