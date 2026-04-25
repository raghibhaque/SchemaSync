import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, TrendingUp, Zap } from 'lucide-react'
import type { ProgressMetrics } from '../../hooks/useProgressMetrics'

interface Props {
  metrics: ProgressMetrics
}

export default function ProgressDashboard({ metrics }: Props) {
  const getReviewStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'from-emerald-500 to-emerald-400'
    if (percentage >= 75) return 'from-green-500 to-green-400'
    if (percentage >= 50) return 'from-blue-500 to-blue-400'
    if (percentage >= 25) return 'from-amber-500 to-amber-400'
    return 'from-rose-500 to-rose-400'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-300'
    if (confidence >= 0.6) return 'text-blue-300'
    if (confidence >= 0.4) return 'text-amber-300'
    return 'text-rose-300'
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">Progress Overview</h3>

        {/* Main metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <p className="text-[10px] uppercase tracking-wider text-white/40">Reviewed</p>
            </div>
            <p className="text-lg font-bold text-emerald-300">
              {metrics.reviewedMappings}/{metrics.totalMappings}
            </p>
            <p className="text-xs text-white/50 mt-1">{metrics.reviewedPercentage.toFixed(0)}%</p>
          </motion.div>

          {/* Conflicts */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3.5"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <p className="text-[10px] uppercase tracking-wider text-white/40">Conflicts</p>
            </div>
            <p className="text-lg font-bold text-amber-300">
              {metrics.resolvedConflicts}/{metrics.totalConflicts}
            </p>
            <p className="text-xs text-white/50 mt-1">{metrics.resolvedConflictPercentage.toFixed(0)}%</p>
          </motion.div>

          {/* High Confidence */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3.5"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <p className="text-[10px] uppercase tracking-wider text-white/40">High Conf.</p>
            </div>
            <p className="text-lg font-bold text-blue-300">
              {metrics.highConfidenceCount}/{metrics.totalMappings}
            </p>
            <p className="text-xs text-white/50 mt-1">{metrics.highConfidencePercentage.toFixed(0)}%</p>
          </motion.div>

          {/* Average Confidence */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3.5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              <p className="text-[10px] uppercase tracking-wider text-white/40">Avg Conf.</p>
            </div>
            <p className={`text-lg font-bold ${getConfidenceColor(metrics.averageConfidence)}`}>
              {(metrics.averageConfidence * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-white/50 mt-1">Overall quality</p>
          </motion.div>
        </div>
      </div>

      {/* Review Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-white/60">Review Progress</p>
          <p className="text-xs font-semibold text-white/80">{metrics.reviewedPercentage.toFixed(1)}%</p>
        </div>
        <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${getReviewStatusColor(
              metrics.reviewedPercentage
            )}`}
            initial={{ width: 0 }}
            animate={{ width: `${metrics.reviewedPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Confidence Distribution */}
      {metrics.totalMappings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <p className="text-xs font-medium text-white/60">Confidence Distribution</p>
          <div className="space-y-1.5">
            {[
              { label: 'Excellent (90%+)', count: metrics.confidenceDistribution.excellent, color: 'bg-emerald-400/30' },
              { label: 'Good (70-89%)', count: metrics.confidenceDistribution.good, color: 'bg-blue-400/30' },
              { label: 'Fair (50-69%)', count: metrics.confidenceDistribution.fair, color: 'bg-amber-400/30' },
              { label: 'Poor (<50%)', count: metrics.confidenceDistribution.poor, color: 'bg-rose-400/30' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-xs text-white/50 min-w-fit">{item.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div
                    className={item.color}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / metrics.totalMappings) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs font-medium text-white/60 min-w-[2rem] text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
