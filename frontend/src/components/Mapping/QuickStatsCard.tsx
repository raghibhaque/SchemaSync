import { useMemo } from 'react'
import { AlertCircle, CheckCircle2, TrendingUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuickStats, ComplexityLevel, RiskLevel } from '@/types'

interface QuickStatsCardProps {
  stats: QuickStats | null
  compact?: boolean
}

export function QuickStatsCard({ stats, compact = false }: QuickStatsCardProps) {
  if (!stats) {
    return (
      <div className={cn(
        'rounded-lg border border-slate-700 bg-slate-900/40 p-4',
        compact ? 'py-3' : 'p-6'
      )}>
        <p className="text-sm text-slate-400">No reconciliation results yet</p>
      </div>
    )
  }

  const complexityColor = _getComplexityColor(stats.complexity_level)
  const riskColor = _getRiskColor(stats.risk_level)

  if (compact) {
    return (
      <div className="flex gap-3 rounded-lg border border-slate-700 bg-slate-900/40 p-3 text-xs">
        <Stat
          label="Match"
          value={`${stats.match_percentage}%`}
          color="text-blue-400"
        />
        <div className="border-r border-slate-600" />
        <Stat
          label="Complexity"
          value={stats.complexity_level}
          color={complexityColor}
        />
        <div className="border-r border-slate-600" />
        <Stat
          label="Risk"
          value={stats.risk_level}
          color={riskColor}
        />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6">
      <h3 className="mb-4 font-semibold text-slate-100">Quick Stats</h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatBlock
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Match %"
          value={`${stats.match_percentage}%`}
          subtext={`${stats.total_tables_matched}/${stats.total_tables_source} tables`}
          color="text-blue-400"
        />

        <StatBlock
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg Confidence"
          value={`${(stats.average_confidence * 100).toFixed(0)}%`}
          subtext={`${stats.total_columns_matched} cols matched`}
          color="text-emerald-400"
        />

        <StatBlock
          icon={<Zap className="h-4 w-4" />}
          label="Complexity"
          value={stats.complexity_level}
          subtext={`${stats.total_conflicts} conflicts`}
          color={complexityColor}
        />

        <StatBlock
          icon={<AlertCircle className="h-4 w-4" />}
          label="Risk Level"
          value={stats.risk_level}
          subtext={`Score: ${stats.risk_score}%`}
          color={riskColor}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-700 pt-4 text-xs text-slate-400 md:grid-cols-4">
        <div>
          <span className="text-slate-500">Unmatched Source:</span>
          <span className="ml-1 text-slate-200">{stats.unmatched_source_count}</span>
        </div>
        <div>
          <span className="text-slate-500">Unmatched Target:</span>
          <span className="ml-1 text-slate-200">{stats.unmatched_target_count}</span>
        </div>
        <div>
          <span className="text-slate-500">Total Conflicts:</span>
          <span className="ml-1 text-slate-200">{stats.total_conflicts}</span>
        </div>
        <div>
          <span className="text-slate-500">Critical:</span>
          <span className="ml-1 text-red-400">{stats.critical_conflicts}</span>
        </div>
      </div>
    </div>
  )
}

interface StatBlockProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext?: string
  color?: string
}

function StatBlock({
  icon,
  label,
  value,
  subtext,
  color = 'text-slate-400',
}: StatBlockProps) {
  return (
    <div className="rounded border border-slate-700/50 bg-slate-800/20 p-3">
      <div className={cn('mb-1 flex items-center gap-1', color)}>
        {icon}
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <div className={cn('text-lg font-bold', color)}>{value}</div>
      {subtext && (
        <div className="mt-1 text-xs text-slate-500">{subtext}</div>
      )}
    </div>
  )
}

interface StatProps {
  label: string
  value: string | number
  color?: string
}

function Stat({ label, value, color = 'text-slate-200' }: StatProps) {
  return (
    <div>
      <span className="text-slate-500">{label}:</span>
      <span className={cn('ml-1 font-semibold', color)}>{value}</span>
    </div>
  )
}

function _getComplexityColor(level: ComplexityLevel): string {
  switch (level) {
    case 'Simple':
      return 'text-emerald-400'
    case 'Moderate':
      return 'text-yellow-400'
    case 'Complex':
      return 'text-red-400'
  }
}

function _getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'Low':
      return 'text-emerald-400'
    case 'Medium':
      return 'text-yellow-400'
    case 'High':
      return 'text-orange-400'
    case 'Critical':
      return 'text-red-400'
  }
}
