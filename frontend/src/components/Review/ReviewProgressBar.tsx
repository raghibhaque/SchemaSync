import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Edit3, Circle } from 'lucide-react'
import type { ReviewStats } from '../../types/review'

interface Props {
  stats: ReviewStats
  compact?: boolean
}

export default function ReviewProgressBar({ stats, compact = false }: Props) {
  const segments = [
    { count: stats.approved, color: 'bg-emerald-500/80', icon: CheckCircle, label: 'Approved' },
    { count: stats.rejected, color: 'bg-rose-500/80', icon: XCircle, label: 'Rejected' },
    { count: stats.modified, color: 'bg-blue-500/80', icon: Edit3, label: 'Modified' },
    { count: stats.unreviewed, color: 'bg-slate-500/40', icon: Circle, label: 'Unreviewed' },
  ]

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Progress Bar */}
        <div className="flex gap-0.5 h-2 rounded-full bg-white/[0.05] overflow-hidden border border-white/[0.08]">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.label}
              initial={{ width: 0 }}
              animate={{ width: `${(seg.count / stats.total) * 100}%` }}
              transition={{ delay: i * 0.05 }}
              className={seg.color}
              title={`${seg.label}: ${seg.count}`}
            />
          ))}
        </div>

        {/* Inline Stats */}
        <div className="flex gap-2 text-xs">
          <div className="text-white/70">
            <span className="font-semibold text-white">{stats.percentReviewed}%</span> reviewed
          </div>
          <div className="text-white/50 hidden sm:block">
            ({stats.approved}A / {stats.rejected}R / {stats.modified}M / {stats.unreviewed}U)
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-lg">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Review Progress</h3>
        <div className="text-2xl font-bold text-indigo-400">
          {stats.percentReviewed}%
          <span className="text-sm text-white/50 ml-2">Complete</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-0.5 h-4 rounded-lg bg-white/[0.05] overflow-hidden border border-white/[0.08]">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.label}
            initial={{ width: 0 }}
            animate={{ width: `${(seg.count / stats.total) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className={seg.color}
          />
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {segments.map(seg => (
          <motion.div
            key={seg.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
          >
            <div className="text-xs font-semibold text-white/70 mb-1 flex items-center justify-center gap-1">
              <seg.icon className="h-3 w-3" />
              {seg.label}
            </div>
            <div className="text-xl font-bold text-white">{seg.count}</div>
            <div className="text-xs text-white/50">
              {stats.total > 0 ? Math.round((seg.count / stats.total) * 100) : 0}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Text */}
      <div className="text-xs text-white/60 space-y-1 pt-2 border-t border-white/[0.08]">
        <p>
          <span className="text-white/80 font-semibold">{stats.total - stats.unreviewed}</span> of{' '}
          <span className="text-white/80 font-semibold">{stats.total}</span> mappings reviewed
        </p>
        {stats.unreviewed > 0 && (
          <p className="text-amber-300/80">
            <span className="font-semibold">{stats.unreviewed}</span> mappings still need review
          </p>
        )}
      </div>
    </div>
  )
}
