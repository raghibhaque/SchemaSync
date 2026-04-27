import { useMemo } from 'react'
import { commentAnalyticsEngine } from '../lib/commentAnalytics'
import type { CommentThread } from '../lib/comments'

export function useCommentAnalytics(threads: CommentThread[]) {
  const metrics = useMemo(() => {
    return commentAnalyticsEngine.calculateMetrics(threads)
  }, [threads])

  const topAuthors = useMemo(() => {
    return commentAnalyticsEngine.getTopAuthors(threads, 10)
  }, [threads])

  const engagementScore = useMemo(() => {
    return commentAnalyticsEngine.getEngagementScore(threads)
  }, [threads])

  const healthScore = useMemo(() => {
    return commentAnalyticsEngine.getHealthScore(threads)
  }, [threads])

  const trendByDay = useMemo(() => {
    return Array.from(metrics.commentTrendByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
  }, [metrics.commentTrendByDay])

  const trendByHour = useMemo(() => {
    return Array.from(metrics.commentTrendByHour.entries())
      .sort((a, b) => a[0] - b[0])
  }, [metrics.commentTrendByHour])

  const authorActivity = useMemo(() => {
    return Array.from(metrics.authorActivityMap.entries())
      .sort((a, b) => b[1].comments - a[1].comments)
  }, [metrics.authorActivityMap])

  return {
    metrics,
    topAuthors,
    engagementScore,
    healthScore,
    trendByDay,
    trendByHour,
    authorActivity,
  }
}

export function useCommentPeriodComparison(threadsBefore: CommentThread[], threadsAfter: CommentThread[]) {
  const comparison = useMemo(() => {
    return commentAnalyticsEngine.comparePeriods(threadsBefore, threadsAfter)
  }, [threadsBefore, threadsAfter])

  return comparison
}
