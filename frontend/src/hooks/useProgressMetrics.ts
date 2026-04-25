import { useMemo } from 'react'
import type { ReconciliationResult } from '../types'

export interface ProgressMetrics {
  totalMappings: number
  reviewedMappings: number
  reviewedPercentage: number
  totalConflicts: number
  resolvedConflicts: number
  resolvedConflictPercentage: number
  highConfidenceCount: number
  highConfidencePercentage: number
  averageConfidence: number
  confidenceDistribution: {
    excellent: number // 90-100%
    good: number // 70-89%
    fair: number // 50-69%
    poor: number // 0-49%
  }
}

export function useProgressMetrics(
  result: ReconciliationResult | null,
  reviewed: Set<number>,
  resolvedConflicts: number
): ProgressMetrics {
  return useMemo(() => {
    if (!result?.table_mappings) {
      return {
        totalMappings: 0,
        reviewedMappings: 0,
        reviewedPercentage: 0,
        totalConflicts: 0,
        resolvedConflicts: 0,
        resolvedConflictPercentage: 0,
        highConfidenceCount: 0,
        highConfidencePercentage: 0,
        averageConfidence: 0,
        confidenceDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
      }
    }

    const mappings = result.table_mappings
    const totalMappings = mappings.length
    const reviewedMappings = reviewed.size
    const reviewedPercentage = totalMappings > 0 ? (reviewedMappings / totalMappings) * 100 : 0

    const totalConflicts = result.summary.total_conflicts
    const resolvedConflictPercentage =
      totalConflicts > 0 ? (resolvedConflicts / totalConflicts) * 100 : 0

    const highConfidenceCount = mappings.filter(m => m.confidence >= 0.8).length
    const highConfidencePercentage = totalMappings > 0 ? (highConfidenceCount / totalMappings) * 100 : 0

    const averageConfidence = result.summary.average_confidence

    // Distribution
    const distribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    }

    mappings.forEach(m => {
      const conf = m.confidence
      if (conf >= 0.9) distribution.excellent++
      else if (conf >= 0.7) distribution.good++
      else if (conf >= 0.5) distribution.fair++
      else distribution.poor++
    })

    return {
      totalMappings,
      reviewedMappings,
      reviewedPercentage,
      totalConflicts,
      resolvedConflicts,
      resolvedConflictPercentage,
      highConfidenceCount,
      highConfidencePercentage,
      averageConfidence,
      confidenceDistribution: distribution,
    }
  }, [result, reviewed, resolvedConflicts])
}
