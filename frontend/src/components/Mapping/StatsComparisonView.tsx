import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuickStats } from '@/types'
import { useStatsHistory } from '@/hooks/useStatsHistory'

interface StatsComparisonViewProps {
  stats: QuickStats | null
  schemaKey: string
}

export function StatsComparisonView({ stats, schemaKey }: StatsComparisonViewProps) {
  const { history, recordStats, lastEntry, getTrend, getChange } = useStatsHistory(schemaKey)

  if (!stats) return null

  const handleRecordSnapshot = () => {
    recordStats(stats, `Snapshot at ${new Date().toLocaleTimeString()}`)
  }

  const hasHistory = history.length > 1

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-100 text-sm">Stats Comparison</h3>
        <button
          onClick={handleRecordSnapshot}
          className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30"
        >
          Snapshot Current
        </button>
      </div>

      {!hasHistory ? (
        <p className="text-xs text-slate-400 py-2">
          Click "Snapshot Current" to record stats and compare over time
        </p>
      ) : (
        <div className="space-y-2 text-xs">
          <ComparisonRow
            label="Match %"
            current={stats.match_percentage}
            previous={lastEntry?.stats.match_percentage}
            trend={getTrend('match_percentage')}
            change={getChange('match_percentage')}
            isPercentage
          />
          <ComparisonRow
            label="Avg Confidence"
            current={Math.round(stats.average_confidence * 100)}
            previous={lastEntry ? Math.round(lastEntry.stats.average_confidence * 100) : undefined}
            trend={getTrend('average_confidence')}
            change={getChange('average_confidence')}
            isPercentage
          />
          <ComparisonRow
            label="Risk Score"
            current={stats.risk_score}
            previous={lastEntry?.stats.risk_score}
            trend={getTrend('risk_score')}
            change={getChange('risk_score')}
          />
          <ComparisonRow
            label="Total Conflicts"
            current={stats.total_conflicts}
            previous={lastEntry?.stats.total_conflicts}
            trend={getTrend('total_conflicts')}
            change={getChange('total_conflicts')}
          />
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-3 text-xs text-slate-500">
          {history.length} snapshot{history.length > 1 ? 's' : ''} recorded
        </div>
      )}
    </div>
  )
}

interface ComparisonRowProps {
  label: string
  current: number | undefined
  previous: number | undefined
  trend: 'up' | 'down' | 'flat' | null
  change: number | null
  isPercentage?: boolean
}

function ComparisonRow({
  label,
  current,
  previous,
  trend,
  change,
  isPercentage = false,
}: ComparisonRowProps) {
  if (current === undefined) return null

  const formatValue = (val: number) => (isPercentage ? `${val}%` : String(val))
  const trendIcon =
    trend === 'up' ? (
      <TrendingUp className="h-3 w-3 text-red-400" />
    ) : trend === 'down' ? (
      <TrendingDown className="h-3 w-3 text-emerald-400" />
    ) : (
      <Minus className="h-3 w-3 text-slate-500" />
    )

  const changeText = change !== null ? (change > 0 ? '+' : '') + change : ''
  const changeColor =
    trend === 'up' && change && change > 0
      ? 'text-red-400'
      : trend === 'down' && change && change < 0
        ? 'text-emerald-400'
        : 'text-slate-500'

  return (
    <div className="flex items-center justify-between py-1 px-2 bg-slate-800/20 rounded">
      <span className="text-slate-400">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-slate-200">{formatValue(current)}</span>
        {previous !== undefined && (
          <>
            <span className="text-slate-600">→</span>
            <span className="text-slate-500">{formatValue(previous)}</span>
            <div className="flex items-center gap-1">
              {trendIcon}
              {change !== null && (
                <span className={cn('font-medium', changeColor)}>
                  {changeText}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
