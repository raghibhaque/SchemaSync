import type { ReconciliationResult } from '../../types'

type Props = {
  result: ReconciliationResult
}

export default function ConflictReport({ result }: Props) {
  // Collect all conflicts from column mappings
  const allConflicts = result.table_mappings.flatMap((table, tableIdx) =>
    table.column_mappings.flatMap((col, colIdx) =>
      col.conflicts.map((conflict: unknown) => ({
        tableIdx,
        colIdx,
        tableName: `${table.table_a.name} → ${table.table_b.name}`,
        columnPair: `${col.col_a.name} → ${col.col_b.name}`,
        conflict,
      }))
    )
  )

  const totalConflicts = result.summary.total_conflicts
  const criticalConflicts = result.summary.critical_conflicts

  const getCriticalityColor = (severity: string | unknown) => {
    if (typeof severity === 'string') {
      if (severity === 'error') return 'bg-red-100 text-red-800 border-red-300'
      if (severity === 'warning') return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      if (severity === 'info') return 'bg-blue-100 text-blue-800 border-blue-300'
    }
    return 'bg-slate-100 text-slate-800 border-slate-300'
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-lg border p-4 ${
          totalConflicts === 0
            ? 'bg-green-50 border-green-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <p className={`text-sm font-medium ${
            totalConflicts === 0 ? 'text-green-600' : 'text-orange-600'
          }`}>
            Total Conflicts
          </p>
          <p className={`text-3xl font-bold mt-1 ${
            totalConflicts === 0 ? 'text-green-900' : 'text-orange-900'
          }`}>
            {totalConflicts}
          </p>
        </div>

        <div className={`rounded-lg border p-4 ${
          criticalConflicts === 0
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            criticalConflicts === 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            Critical
          </p>
          <p className={`text-3xl font-bold mt-1 ${
            criticalConflicts === 0 ? 'text-green-900' : 'text-red-900'
          }`}>
            {criticalConflicts}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {totalConflicts === 0 ? (
        <div className="rounded-lg bg-green-50 border-2 border-green-200 p-8 text-center">
          <div className="flex justify-center mb-3">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-1">All Clear!</h3>
          <p className="text-green-700">No conflicts detected in the reconciliation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Issues Found
            </h3>
            <span className="text-xs font-medium text-slate-500">
              {allConflicts.length} conflicts detected
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allConflicts.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 text-sm ${getCriticalityColor(
                  typeof item.conflict === 'object' && item.conflict !== null && 'severity' in item.conflict
                    ? (item.conflict as any).severity
                    : 'info'
                )}`}
              >
                <div className="font-medium mb-1">
                  {item.tableName}
                </div>
                <div className="text-xs opacity-90">
                  Column: {item.columnPair}
                </div>
                {typeof item.conflict === 'object' && item.conflict !== null && (
                  <div className="text-xs opacity-75 mt-1">
                    {typeof (item.conflict as any).description === 'string'
                      ? (item.conflict as any).description
                      : JSON.stringify(item.conflict)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      {totalConflicts > 0 && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-3 uppercase">Severity Levels</p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-600" />
              <span className="text-slate-700">Error</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-yellow-600" />
              <span className="text-slate-700">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-600" />
              <span className="text-slate-700">Info</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
