import type { StatsHistoryEntry } from '@/hooks/useStatsHistory'

export function exportStatsAsJSON(history: StatsHistoryEntry[], filename: string = 'stats-history.json'): void {
  const json = JSON.stringify(history, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadFile(blob, filename)
}

export function exportStatsAsCSV(history: StatsHistoryEntry[], filename: string = 'stats-history.csv'): void {
  if (history.length === 0) return

  const headers = [
    'Timestamp',
    'Date',
    'Label',
    'Total Tables Matched',
    'Total Tables Source',
    'Total Tables Target',
    'Total Columns Matched',
    'Match Percentage',
    'Average Confidence',
    'Complexity Level',
    'Risk Level',
    'Risk Score',
    'Critical Conflicts',
    'Total Conflicts',
  ]

  const rows = history.map((entry) => [
    entry.timestamp,
    new Date(entry.timestamp).toISOString(),
    entry.label || '',
    entry.stats.total_tables_matched,
    entry.stats.total_tables_source,
    entry.stats.total_tables_target,
    entry.stats.total_columns_matched,
    entry.stats.match_percentage,
    (entry.stats.average_confidence * 100).toFixed(1),
    entry.stats.complexity_level,
    entry.stats.risk_level,
    entry.stats.risk_score,
    entry.stats.critical_conflicts,
    entry.stats.total_conflicts,
  ])

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) =>
          typeof cell === 'string' && cell.includes(',')
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        )
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, filename)
}

function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
