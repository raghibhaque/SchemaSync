import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, TrendingUp, Book, Zap } from 'lucide-react'
import type { ReconciliationResult } from '../../types'
import { cn } from '@/lib/utils'

interface Props { result: ReconciliationResult }

export default function EquivalenceGraph({ result }: Props) {
  const { table_mappings, summary, unmatched_tables_a } = result
  const totalTables = summary.tables_in_a
  const matchedCount = summary.tables_matched
  const unmatchedCount = unmatched_tables_a.length
  const totalColumnsMapped = table_mappings.reduce((sum, m) => sum + m.column_mappings.length, 0)

  const avgConfidence = summary.average_confidence
  const qualityPercentage = Math.round(avgConfidence * 100)

  // Confidence distribution
  const distribution = {
    excellent: table_mappings.filter(m => m.confidence >= 0.9).length,
    veryGood:  table_mappings.filter(m => m.confidence >= 0.8 && m.confidence < 0.9).length,
    good:      table_mappings.filter(m => m.confidence >= 0.6 && m.confidence < 0.8).length,
    fair:      table_mappings.filter(m => m.confidence >= 0.4 && m.confidence < 0.6).length,
    poor:      table_mappings.filter(m => m.confidence < 0.4).length,
  }

  if (table_mappings.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-6 py-16 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-white/20" />
        <p className="text-sm text-white/25">No mappings to visualize</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Title + Explanation */}
      <div>
        <h2 className="text-lg font-semibold text-white/80 flex items-center gap-2">
          <Book className="h-5 w-5 text-indigo-400" />
          Table Matching Overview
        </h2>
        <p className="mt-1 text-xs text-white/40">
          See how many tables were matched and their quality. Lower numbers mean manual review needed.
        </p>
      </div>

      {/* Quality Meter */}
      <QualityMeter percentage={qualityPercentage} />

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Tables Matched"
          value={String(matchedCount)}
          detail={`out of ${totalTables}`}
          color="emerald"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Need Review"
          value={String(unmatchedCount)}
          detail={`${unmatchedCount === 0 ? 'none' : 'check manually'}`}
          color={unmatchedCount > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg Quality"
          value={`${qualityPercentage}%`}
          detail={getQualityLabel(qualityPercentage)}
          color={getQualityColor(qualityPercentage)}
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Columns Mapped"
          value={String(totalColumnsMapped)}
          detail={`automatic mapping`}
          color="indigo"
        />
      </div>

      {/* Visual Breakdown */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Match Distribution Pie */}
        <MatchDistributionPie matched={matchedCount} unmatched={unmatchedCount} />

        {/* Confidence Quality Bars */}
        <ConfidenceDistribution distribution={distribution} total={matchedCount} />
      </div>

      {/* Detailed Mapping Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/70">All Matched Tables</h3>
        <MappingsList mappings={table_mappings} />
      </div>

      {/* Recommendations */}
      <Recommendations
        qualityPercentage={qualityPercentage}
        unmatchedCount={unmatchedCount}
        lowQualityCount={distribution.fair + distribution.poor}
      />
    </div>
  )
}

function QualityMeter({ percentage }: { percentage: number }) {
  const getLabel = (pct: number) => {
    if (pct >= 90) return 'Excellent'
    if (pct >= 80) return 'Very Good'
    if (pct >= 60) return 'Good'
    if (pct >= 40) return 'Fair'
    return 'Needs Work'
  }

  const getColor = (pct: number) => {
    if (pct >= 90) return 'from-emerald-500 to-emerald-400'
    if (pct >= 80) return 'from-cyan-500 to-cyan-400'
    if (pct >= 60) return 'from-amber-500 to-amber-400'
    if (pct >= 40) return 'from-orange-500 to-orange-400'
    return 'from-rose-500 to-rose-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-white/[0.1] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-8">
        {/* Circular Progress with glow */}
        <div className="relative h-28 w-28 shrink-0">
          {/* Glow effect */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: percentage >= 90 ? '0 0 24px rgba(16,185,129,0.4)' :
                        percentage >= 80 ? '0 0 24px rgba(34,211,238,0.4)' :
                        percentage >= 60 ? '0 0 24px rgba(217,119,6,0.4)' :
                        percentage >= 40 ? '0 0 24px rgba(249,115,22,0.4)' :
                        '0 0 24px rgba(244,63,94,0.4)',
            }}
          />
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 45}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - percentage / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className={`stroke-current drop-shadow-lg`}
              style={{
                stroke: percentage >= 90 ? '#10b981' :
                       percentage >= 80 ? '#06b6d4' :
                       percentage >= 60 ? '#d97706' :
                       percentage >= 40 ? '#f97316' :
                       '#f43f5e',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-3xl font-bold bg-gradient-to-br from-white/90 to-white/60 bg-clip-text text-transparent"
            >
              {percentage}%
            </motion.span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <motion.h3
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-white/90"
          >
            {getLabel(percentage)}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-2 text-sm text-white/50 leading-relaxed"
          >
            {percentage >= 80
              ? '✓ Your schemas match very well. Proceed with confidence.'
              : percentage >= 60
                ? '⚠ Good match overall. Review flagged items before migration.'
                : '⚠ Manual intervention recommended before proceeding.'}
          </motion.p>
          <div className="mt-4 h-2 rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getColor(percentage)} shadow-[0_0_12px_currentColor]`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({
  icon, label, value, detail, color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  color: string
}) {
  const colors = {
    emerald: {
      border: 'border-emerald-500/30',
      bg: 'bg-gradient-to-br from-emerald-500/12 to-emerald-600/4',
      text: 'text-emerald-300',
      icon: 'text-emerald-400/70',
      glow: 'shadow-[0_8px_24px_rgba(16,185,129,0.15)]',
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-gradient-to-br from-amber-500/12 to-amber-600/4',
      text: 'text-amber-300',
      icon: 'text-amber-400/70',
      glow: 'shadow-[0_8px_24px_rgba(217,119,6,0.15)]',
    },
    indigo: {
      border: 'border-indigo-500/30',
      bg: 'bg-gradient-to-br from-indigo-500/12 to-indigo-600/4',
      text: 'text-indigo-300',
      icon: 'text-indigo-400/70',
      glow: 'shadow-[0_8px_24px_rgba(99,102,241,0.15)]',
    },
  }

  const c = colors[color as keyof typeof colors] ?? colors.indigo

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn('relative overflow-hidden rounded-lg border p-4 backdrop-blur-sm transition-all', c.border, c.bg, c.glow)}
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 h-16 w-16 rounded-full opacity-20 blur-xl" style={{
        background: color === 'emerald' ? 'radial-gradient(circle, #10b981, transparent)' :
                   color === 'amber' ? 'radial-gradient(circle, #d97706, transparent)' :
                   'radial-gradient(circle, #6366f1, transparent)',
      }} />

      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className={cn('mb-2.5', c.icon)}
        >
          {icon}
        </motion.div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={cn('mt-2 text-2xl font-bold', c.text)}
        >
          {value}
        </motion.p>
        <p className="mt-1.5 text-xs text-white/50 font-medium">{detail}</p>
      </div>
    </motion.div>
  )
}

function MatchDistributionPie({ matched, unmatched }: { matched: number; unmatched: number }) {
  const total = matched + unmatched
  const matchedPercent = (matched / total) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
    >
      <h3 className="mb-4 text-sm font-semibold text-white/70">Matching Result</h3>

      <div className="flex items-start gap-6">
        {/* Pie chart */}
        <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="#10b981"
              strokeWidth="8"
              strokeDasharray={`${(matchedPercent / 100) * 2 * Math.PI * 35} ${2 * Math.PI * 35}`}
              initial={{ strokeDasharray: `0 ${2 * Math.PI * 35}` }}
              animate={{ strokeDasharray: `${(matchedPercent / 100) * 2 * Math.PI * 35} ${2 * Math.PI * 35}` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
            />
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-bold text-white/70">{matchedPercent.toFixed(0)}%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/60">Matched: {matched} tables</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-400" />
            <span className="text-xs text-white/60">Unmatched: {unmatched} tables</span>
          </div>
          <p className="mt-3 text-[10px] text-white/30 leading-relaxed">
            {matched === total
              ? '✓ All tables found a match!'
              : `${unmatched} table${unmatched !== 1 ? 's' : ''} need manual mapping.`}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function ConfidenceDistribution({
  distribution,
  total,
}: {
  distribution: Record<string, number>
  total: number
}) {
  const levels = [
    { key: 'excellent', label: 'Excellent (90%+)', color: 'emerald' },
    { key: 'veryGood', label: 'Very Good (80-89%)', color: 'cyan' },
    { key: 'good', label: 'Good (60-79%)', color: 'amber' },
    { key: 'fair', label: 'Fair (40-59%)', color: 'orange' },
    { key: 'poor', label: 'Poor (<40%)', color: 'rose' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
    >
      <h3 className="mb-4 text-sm font-semibold text-white/70">Match Quality Distribution</h3>

      <div className="space-y-2.5">
        {levels.map(({ key, label, color }, i) => {
          const count = distribution[key as keyof typeof distribution] || 0
          const percent = total > 0 ? (count / total) * 100 : 0

          const colorClasses = {
            emerald: 'bg-emerald-400',
            cyan: 'bg-cyan-400',
            amber: 'bg-amber-400',
            orange: 'bg-orange-400',
            rose: 'bg-rose-400',
          }

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-white/50">{label}</span>
                <span className="font-semibold text-white/70">{count} matches</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className={colorClasses[color as keyof typeof colorClasses]}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

function MappingsList({ mappings }: { mappings: any[] }) {
  return (
    <div className="space-y-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 max-h-64 overflow-y-auto">
      {mappings.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.02 }}
          className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-xs"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white/70">
              <code className="text-indigo-300">{m.table_a.name}</code>
              <span className="mx-2 text-white/20">→</span>
              <code className="text-violet-300">{m.table_b.name}</code>
            </p>
            <p className="mt-1 text-[10px] text-white/30">
              {m.column_mappings.length} columns matched
            </p>
          </div>
          <div className="ml-3 flex items-center gap-2 shrink-0">
            <div
              className={cn(
                'h-2 w-12 rounded-full bg-white/[0.1]',
                m.confidence >= 0.8 ? 'bg-emerald-400/30' :
                m.confidence >= 0.6 ? 'bg-amber-400/30' :
                'bg-rose-400/30'
              )}
            >
              <div
                className={cn(
                  'h-full rounded-full',
                  m.confidence >= 0.8 ? 'bg-emerald-400' :
                  m.confidence >= 0.6 ? 'bg-amber-400' :
                  'bg-rose-400'
                )}
                style={{ width: `${m.confidence * 100}%` }}
              />
            </div>
            <span className="w-10 text-right font-semibold text-white/50">
              {(m.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function Recommendations({
  qualityPercentage,
  unmatchedCount,
  lowQualityCount,
}: {
  qualityPercentage: number
  unmatchedCount: number
  lowQualityCount: number
}) {
  let recommendation = ''
  let icon = <CheckCircle className="h-4 w-4" />
  let color = 'emerald'

  if (qualityPercentage < 60 || unmatchedCount > 0 || lowQualityCount > 0) {
    icon = <AlertCircle className="h-4 w-4" />
    color = 'amber'
    recommendation = `Review ${unmatchedCount > 0 ? `${unmatchedCount} unmatched table${unmatchedCount !== 1 ? 's' : ''}` : `${lowQualityCount} low-quality matches`} before proceeding with migration.`
  } else {
    recommendation = 'Quality looks good! You can proceed to review conflicts and generate migration SQL.'
  }

  const colors = {
    emerald: 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300',
    amber: 'border-amber-500/20 bg-amber-500/[0.06] text-amber-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-lg border p-4 flex items-start gap-3', colors[color as keyof typeof colors])}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p className="text-sm leading-relaxed">{recommendation}</p>
    </motion.div>
  )
}

function getQualityLabel(percentage: number): string {
  if (percentage >= 90) return 'Excellent match'
  if (percentage >= 80) return 'Very good match'
  if (percentage >= 60) return 'Good match'
  if (percentage >= 40) return 'Fair match'
  return 'Needs review'
}

function getQualityColor(percentage: number): string {
  if (percentage >= 90) return 'emerald'
  if (percentage >= 80) return 'cyan'
  if (percentage >= 60) return 'amber'
  if (percentage >= 40) return 'orange'
  return 'rose'
}
