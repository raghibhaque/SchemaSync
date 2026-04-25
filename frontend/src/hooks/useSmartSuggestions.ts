import { useMemo } from 'react'
import type { TableMapping } from '../types'

export interface ColumnSuggestion {
  sourceCol: string
  targetCol: string
  score: number
  reasons: string[]
}

function levenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()
  const m = aLower.length
  const n = bLower.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (aLower[i - 1] === bLower[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}

function calculateNameSimilarity(a: string, b: string): number {
  const distance = levenshteinDistance(a, b)
  const maxLen = Math.max(a.length, b.length)
  return Math.max(0, 1 - distance / maxLen)
}

function extractPrefixSuffix(name: string): { prefix: string; suffix: string; core: string } {
  const commonPrefixes = ['id_', 'fk_', 'pk_', 'tbl_', 'col_', 'src_', 'dst_', 'from_', 'to_']
  const commonSuffixes = ['_id', '_name', '_date', '_time', '_code', '_desc', '_val']

  let prefix = ''
  let suffix = ''

  for (const p of commonPrefixes) {
    if (name.toLowerCase().startsWith(p)) {
      prefix = p
      break
    }
  }

  for (const s of commonSuffixes) {
    if (name.toLowerCase().endsWith(s)) {
      suffix = s
      break
    }
  }

  const core = name.slice(prefix.length, name.length - suffix.length)
  return { prefix, suffix, core }
}

function calculateTypeSimilarity(typeA: string | undefined, typeB: string | undefined): number {
  if (!typeA || !typeB) return 0.5
  if (typeA === typeB) return 1

  const normalizeType = (t: string) => t.toLowerCase().split('(')[0].trim()
  const normA = normalizeType(typeA)
  const normB = normalizeType(typeB)

  if (normA === normB) return 1

  const numericTypes = new Set(['int', 'integer', 'bigint', 'smallint', 'tinyint', 'decimal', 'float', 'double', 'numeric', 'number'])
  const stringTypes = new Set(['varchar', 'char', 'text', 'string', 'nvarchar', 'nchar'])
  const dateTypes = new Set(['date', 'datetime', 'timestamp', 'time', 'datetime2'])
  const boolTypes = new Set(['boolean', 'bool', 'bit'])

  const categorizeType = (t: string) => {
    if (numericTypes.has(t)) return 'numeric'
    if (stringTypes.has(t)) return 'string'
    if (dateTypes.has(t)) return 'date'
    if (boolTypes.has(t)) return 'bool'
    return 'other'
  }

  const catA = categorizeType(normA)
  const catB = categorizeType(normB)

  return catA === catB ? 0.7 : 0.2
}

export function useSmartSuggestions(mapping: TableMapping): ColumnSuggestion[] {
  return useMemo(() => {
    const suggestions: ColumnSuggestion[] = []
    const mappedTargetCols = new Set(mapping.column_mappings?.map(m => m.col_b.name) ?? [])

    const unmappedSourceCols = mapping.table_a.columns.filter(
      col => !mapping.column_mappings?.some(m => m.col_a.name === col.name)
    )
    const unmappedTargetCols = mapping.table_b.columns.filter(col => !mappedTargetCols.has(col.name))

    for (const sourceCol of unmappedSourceCols) {
      const scores: Array<{ targetCol: typeof unmappedTargetCols[0]; score: number }> = []

      for (const targetCol of unmappedTargetCols) {
        let score = 0
        const reasons: string[] = []

        const nameSimilarity = calculateNameSimilarity(sourceCol.name, targetCol.name)
        score += nameSimilarity * 0.4

        const { core: sourceCore } = extractPrefixSuffix(sourceCol.name)
        const { core: targetCore } = extractPrefixSuffix(targetCol.name)
        const coreSimilarity = calculateNameSimilarity(sourceCore, targetCore)
        score += coreSimilarity * 0.3
        if (coreSimilarity > 0.8) reasons.push('Similar core names')

        const typeSimilarity = calculateTypeSimilarity(sourceCol.data_type?.base_type, targetCol.data_type?.base_type)
        score += typeSimilarity * 0.3
        if (typeSimilarity > 0.8) reasons.push('Compatible types')

        if (score > 0) {
          scores.push({ targetCol, score })
        }
      }

      if (scores.length > 0) {
        scores.sort((a, b) => b.score - a.score)
        const topMatch = scores[0]

        if (topMatch.score > 0.3) {
          const reasons: string[] = []
          const nameSimilarity = calculateNameSimilarity(sourceCol.name, topMatch.targetCol.name)
          const typeSimilarity = calculateTypeSimilarity(sourceCol.data_type?.base_type, topMatch.targetCol.data_type?.base_type)
          const { core: sourceCore } = extractPrefixSuffix(sourceCol.name)
          const { core: targetCore } = extractPrefixSuffix(topMatch.targetCol.name)
          const coreSimilarity = calculateNameSimilarity(sourceCore, targetCore)

          if (nameSimilarity > 0.7) reasons.push('Name match')
          if (coreSimilarity > 0.8) reasons.push('Core name match')
          if (typeSimilarity > 0.8) reasons.push('Type match')
          if (reasons.length === 0 && topMatch.score > 0.5) reasons.push('Pattern match')

          suggestions.push({
            sourceCol: sourceCol.name,
            targetCol: topMatch.targetCol.name,
            score: topMatch.score,
            reasons,
          })
        }
      }
    }

    return suggestions.sort((a, b) => b.score - a.score)
  }, [mapping])
}
