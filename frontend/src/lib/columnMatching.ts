// Common column name synonyms
const SYNONYMS: Record<string, string[]> = {
  'id': ['user_id', 'account_id', 'entity_id', 'object_id', 'item_id', 'record_id'],
  'name': ['title', 'label', 'display_name', 'full_name', 'username'],
  'email': ['mail', 'email_address', 'email_addr'],
  'phone': ['phone_number', 'telephone', 'mobile', 'contact_number'],
  'date': ['timestamp', 'datetime', 'created_at', 'updated_at', 'modified_at'],
  'created_at': ['created_date', 'date_created', 'creation_date'],
  'updated_at': ['updated_date', 'date_updated', 'modification_date', 'last_modified'],
  'address': ['street', 'location', 'place'],
  'country': ['nation', 'region'],
  'state': ['province', 'territory'],
  'city': ['town', 'municipality'],
  'zipcode': ['postal_code', 'zip', 'postcode'],
}

function normalizeColumnName(name: string): string {
  return name.toLowerCase().replace(/[_\-\s]/g, '')
}

function getScore(
  sourceName: string,
  targetName: string,
  sourceType?: string,
  targetType?: string
): number {
  const sourceNorm = normalizeColumnName(sourceName)
  const targetNorm = normalizeColumnName(targetName)

  let score = 0

  // Exact match (normalized)
  if (sourceNorm === targetNorm) return 1.0

  // Check if one is a synonym of the other
  for (const [base, syns] of Object.entries(SYNONYMS)) {
    const baseNorm = normalizeColumnName(base)
    const synMatches = syns.map(s => normalizeColumnName(s))

    if (baseNorm === sourceNorm && synMatches.includes(targetNorm)) return 0.9
    if (baseNorm === targetNorm && synMatches.includes(sourceNorm)) return 0.9
  }

  // Partial match (starts/ends with)
  if (sourceNorm.startsWith(targetNorm) || targetNorm.startsWith(sourceNorm)) {
    score += 0.3
  }

  // Levenshtein-like: count matching characters
  let matching = 0
  const minLen = Math.min(sourceNorm.length, targetNorm.length)
  for (let i = 0; i < minLen; i++) {
    if (sourceNorm[i] === targetNorm[i]) matching++
  }
  score += (matching / Math.max(sourceNorm.length, targetNorm.length)) * 0.4

  // Type match bonus
  if (sourceType && targetType && sourceType === targetType) {
    score += 0.2
  }

  return Math.min(score, 0.99)
}

export interface ColumnSuggestion {
  targetColumn: string
  targetType?: string
  score: number
  reason: string
}

export function suggestMatches(
  sourceColumn: string,
  sourceType: string | undefined,
  availableTargetColumns: Array<{ name: string; dataType?: { base_type?: string } }>
): ColumnSuggestion[] {
  const suggestions = availableTargetColumns
    .map((col) => {
      const score = getScore(sourceColumn, col.name, sourceType, col.dataType?.base_type)
      let reason = ''

      if (score >= 0.9) {
        reason = normalizeColumnName(sourceColumn) === normalizeColumnName(col.name)
          ? 'Exact match (normalized)'
          : 'Synonym match'
      } else if (score >= 0.7) {
        reason = 'Similar names'
      } else if (score >= 0.5) {
        reason = 'Partial match'
      } else {
        return null
      }

      if (col.dataType?.base_type === sourceType) {
        reason += ', matching type'
      }

      return { targetColumn: col.name, targetType: col.dataType?.base_type, score, reason }
    })
    .filter((s) => s !== null && s.score >= 0.5)
    .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
    .slice(0, 3) as ColumnSuggestion[]

  return suggestions
}
