import { useMemo } from 'react'
import type { ReconciliationResult, QuickStats, ComplexityLevel, RiskLevel } from '@/types'

export function useQuickStats(result: ReconciliationResult | null): QuickStats | null {
  return useMemo(() => {
    if (!result) return null

    const summary = result.summary
    const totalTablesMapped = summary.tables_matched
    const totalTablesSource = summary.tables_in_a
    const totalTablesTarget = summary.tables_in_b
    const unmatchedSource = result.unmatched_tables_a?.length ?? 0
    const unmatchedTarget = result.unmatched_tables_b?.length ?? 0

    const totalColumnsSource = result.table_mappings.reduce(
      (sum, tm) => sum + tm.table_a.columns.length,
      0
    )
    const totalColumnsTarget = result.table_mappings.reduce(
      (sum, tm) => sum + tm.table_b.columns.length,
      0
    )
    const totalColumnsMapped = result.table_mappings.reduce(
      (sum, tm) => sum + tm.column_mappings.length,
      0
    )

    const matchPercentage =
      totalTablesSource > 0
        ? Math.round((totalTablesMapped / totalTablesSource) * 100)
        : 0

    const avgConfidence = summary.average_confidence ?? 0
    const criticalConflicts = summary.critical_conflicts ?? 0
    const totalConflicts = summary.total_conflicts ?? 0

    const complexityLevel = _estimateComplexity(
      result,
      totalColumnsMapped,
      avgConfidence,
      criticalConflicts
    )

    const { riskScore, riskLevel } = _assessRisk(
      result,
      unmatchedSource,
      unmatchedTarget,
      totalConflicts
    )

    return {
      total_tables_source: totalTablesSource,
      total_tables_target: totalTablesTarget,
      total_tables_matched: totalTablesMapped,
      total_columns_source: totalColumnsSource,
      total_columns_target: totalColumnsTarget,
      total_columns_matched: totalColumnsMapped,
      match_percentage: matchPercentage,
      average_confidence: avgConfidence,
      complexity_level: complexityLevel,
      risk_level: riskLevel,
      risk_score: riskScore,
      critical_conflicts: criticalConflicts,
      total_conflicts: totalConflicts,
      unmatched_source_count: unmatchedSource,
      unmatched_target_count: unmatchedTarget,
    }
  }, [result])
}

function _estimateComplexity(
  result: ReconciliationResult,
  columnsMapped: number,
  avgConfidence: number,
  criticalConflicts: number
): ComplexityLevel {
  let score = 0

  if (avgConfidence < 0.6) score += 3
  else if (avgConfidence < 0.75) score += 2
  else if (avgConfidence < 0.85) score += 1

  if (criticalConflicts > 3) score += 3
  else if (criticalConflicts > 1) score += 2
  else if (criticalConflicts > 0) score += 1

  const unmatchedCols = result.table_mappings.reduce(
    (sum, tm) =>
      sum + tm.unmatched_columns_a.length + tm.unmatched_columns_b.length,
    0
  )
  if (unmatchedCols > 10) score += 3
  else if (unmatchedCols > 5) score += 2
  else if (unmatchedCols > 0) score += 1

  const lowConfidenceMappings = result.table_mappings.filter(
    (tm) => tm.confidence < 0.65
  ).length
  if (lowConfidenceMappings > 5) score += 2
  else if (lowConfidenceMappings > 0) score += 1

  if (score >= 8) return 'Complex'
  if (score >= 4) return 'Moderate'
  return 'Simple'
}

function _assessRisk(
  result: ReconciliationResult,
  unmatchedSource: number,
  unmatchedTarget: number,
  totalConflicts: number
): { riskScore: number; riskLevel: RiskLevel } {
  let score = 0

  if (unmatchedSource > 5 || unmatchedTarget > 5) score += 25
  else if (unmatchedSource > 2 || unmatchedTarget > 2) score += 15
  else if (unmatchedSource > 0 || unmatchedTarget > 0) score += 8

  if (totalConflicts > 10) score += 30
  else if (totalConflicts > 5) score += 20
  else if (totalConflicts > 0) score += 10

  const lowConfidenceMappings = result.table_mappings.filter(
    (tm) => tm.confidence < 0.65
  ).length
  if (lowConfidenceMappings > 5) score += 20
  else if (lowConfidenceMappings > 0) score += 10

  const unmatchedCols = result.table_mappings.reduce(
    (sum, tm) =>
      sum + tm.unmatched_columns_a.length + tm.unmatched_columns_b.length,
    0
  )
  if (unmatchedCols > 10) score += 15
  else if (unmatchedCols > 5) score += 10
  else if (unmatchedCols > 0) score += 5

  let riskLevel: RiskLevel
  if (score >= 70) riskLevel = 'Critical'
  else if (score >= 50) riskLevel = 'High'
  else if (score >= 25) riskLevel = 'Medium'
  else riskLevel = 'Low'

  return { riskScore: Math.min(score, 100), riskLevel }
}
