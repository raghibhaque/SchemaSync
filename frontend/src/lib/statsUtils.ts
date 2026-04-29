import type { ReconciliationResult, TableMapping } from '@/types'

export interface DataLossRisk {
  hasUnmatchedColumns: boolean
  hasLowConfidenceMapings: boolean
  hasUnmatchedTables: boolean
  droppedColumnCount: number
  riskFactors: string[]
}

export interface MigrationComplexityMetrics {
  riskyConversions: number
  constraintChanges: number
  typeTransformations: number
  droppedElements: number
}

export function assessDataLossRisk(result: ReconciliationResult): DataLossRisk {
  const riskFactors: string[] = []
  let droppedColumnCount = 0

  const hasUnmatchedColumns = result.table_mappings.some(
    (tm) => tm.unmatched_columns_a.length > 0 || tm.unmatched_columns_b.length > 0
  )
  if (hasUnmatchedColumns) {
    riskFactors.push('Unmatched columns may be lost or ignored')
    droppedColumnCount = result.table_mappings.reduce(
      (sum, tm) => sum + tm.unmatched_columns_a.length,
      0
    )
  }

  const hasLowConfidenceMapings = result.table_mappings.some(
    (tm) => tm.confidence < 0.65
  )
  if (hasLowConfidenceMapings) {
    riskFactors.push('Low-confidence mappings may be incorrect')
  }

  const hasUnmatchedTables =
    (result.unmatched_tables_a?.length ?? 0) > 0 ||
    (result.unmatched_tables_b?.length ?? 0) > 0
  if (hasUnmatchedTables) {
    riskFactors.push('Some tables may not be migrated')
  }

  return {
    hasUnmatchedColumns,
    hasLowConfidenceMapings,
    hasUnmatchedTables,
    droppedColumnCount,
    riskFactors,
  }
}

export function getMigrationComplexityMetrics(
  result: ReconciliationResult
): MigrationComplexityMetrics {
  let riskyConversions = 0
  let constraintChanges = 0
  let typeTransformations = 0
  let droppedElements = 0

  for (const mapping of result.table_mappings) {
    for (const colMapping of mapping.column_mappings) {
      const sourceType = colMapping.col_a.data_type?.base_type || ''
      const targetType = colMapping.col_b.data_type?.base_type || ''

      if (_isRiskyConversion(sourceType, targetType)) {
        riskyConversions++
      }

      if (sourceType !== targetType) {
        typeTransformations++
      }
    }

    droppedElements += mapping.unmatched_columns_a.length
  }

  droppedElements += result.unmatched_tables_a?.length ?? 0

  return {
    riskyConversions,
    constraintChanges,
    typeTransformations,
    droppedElements,
  }
}

function _isRiskyConversion(sourceType: string, targetType: string): boolean {
  const risky = [
    ['varchar', 'integer'],
    ['text', 'integer'],
    ['varchar', 'date'],
    ['text', 'date'],
    ['varchar', 'boolean'],
    ['text', 'boolean'],
    ['integer', 'varchar'],
    ['date', 'varchar'],
  ]

  const source = sourceType.toLowerCase()
  const target = targetType.toLowerCase()

  return risky.some(
    ([s, t]) =>
      source.includes(s) && target.includes(t)
  )
}

export function getConfidenceDistribution(result: ReconciliationResult): {
  high: number
  medium: number
  low: number
} {
  const high = result.table_mappings.filter((tm) => tm.confidence >= 0.8).length
  const medium = result.table_mappings.filter(
    (tm) => tm.confidence >= 0.5 && tm.confidence < 0.8
  ).length
  const low = result.table_mappings.filter((tm) => tm.confidence < 0.5).length

  return { high, medium, low }
}

export function estimateMigrationEffort(
  result: ReconciliationResult
): 'hours' | 'days' | 'weeks' {
  const metrics = getMigrationComplexityMetrics(result)
  const score =
    metrics.riskyConversions * 3 +
    metrics.typeTransformations * 1 +
    metrics.droppedElements * 2

  if (score > 50) return 'weeks'
  if (score > 20) return 'days'
  return 'hours'
}
