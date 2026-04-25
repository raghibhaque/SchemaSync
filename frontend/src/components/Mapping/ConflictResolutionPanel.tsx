import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, X, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import type { ConflictResolution } from '../../hooks/useConflictResolutions'

interface Props {
  conflictId?: string
  conflict: {
    message: string
    details?: string
    severity: 'error' | 'warning' | 'info'
    suggestedFix?: string
  }
  resolution?: ConflictResolution
  onMarkResolved: (notes: string, suggestedFix?: string) => void
  onMarkNeedsReview: (notes: string) => void
  onClear: () => void
}

export default function ConflictResolutionPanel({
  conflict,
  resolution,
  onMarkResolved,
  onMarkNeedsReview,
  onClear,
}: Props) {
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(resolution?.notes || '')

  const handleResolve = () => {
    onMarkResolved(notes, resolution?.suggestedFix || conflict.suggestedFix)
    setShowNotes(false)
    setNotes('')
  }

  const handleNeedsReview = () => {
    onMarkNeedsReview(notes)
    setShowNotes(false)
    setNotes('')
  }

  const severityConfig = {
    error: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-300', badge: 'bg-rose-500/20' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-300', badge: 'bg-amber-500/20' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-300', badge: 'bg-blue-500/20' },
  }

  const config = severityConfig[conflict.severity]

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg border ${config.bg} ${config.border} space-y-2`}
    >
      {/* Header with status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <AlertCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${config.text}`} />
          <div className="min-w-0 flex-1">
            <p className={`font-medium text-xs ${config.text}`}>{conflict.message}</p>
            {conflict.details && (
              <p className="text-[11px] opacity-75 mt-1 text-white/60">{conflict.details}</p>
            )}
          </div>
        </div>

        {/* Status badge */}
        {resolution && (
          <span className={`px-2 py-1 rounded text-[10px] font-medium flex-shrink-0 ${
            resolution.status === 'resolved'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/20 text-amber-300'
          }`}>
            {resolution.status === 'resolved' ? '✓ Resolved' : '⊙ Review'}
          </span>
        )}
      </div>

      {/* Resolution notes if resolved */}
      {resolution?.status === 'resolved' && resolution.notes && (
        <div className="mt-2 p-2 rounded bg-white/[0.02] border border-white/[0.05]">
          <p className="text-[11px] text-white/50 mb-1">Resolution notes:</p>
          <p className="text-xs text-white/70 italic">{resolution.notes}</p>
        </div>
      )}

      {/* Action buttons or notes input */}
      {!resolution || resolution.status !== 'resolved' ? (
        <div className="pt-2 space-y-2">
          {!showNotes ? (
            <div className="flex gap-1.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotes(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              >
                <CheckCircle2 className="h-3 w-3" />
                Resolve
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotes(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                <AlertCircle className="h-3 w-3" />
                Flag for Review
              </motion.button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Suggested fix input */}
              {conflict.suggestedFix && (
                <div className="flex items-start gap-2 p-2 rounded bg-white/[0.02] border border-blue-500/20">
                  <Lightbulb className="h-3 w-3 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-blue-300 font-medium">Suggested fix:</p>
                    <p className="text-xs text-white/70 mt-0.5">{conflict.suggestedFix}</p>
                  </div>
                </div>
              )}

              {/* Notes textarea */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add resolution notes..."
                className="w-full text-xs rounded bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/30 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                rows={2}
              />

              {/* Action buttons */}
              <div className="flex gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResolve}
                  className="flex-1 px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors font-medium"
                >
                  Mark Resolved
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNeedsReview}
                  className="flex-1 px-2 py-1 text-xs rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors font-medium"
                >
                  Flag Review
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotes(false)}
                  className="px-2 py-1 text-xs rounded bg-white/[0.08] text-white/60 hover:bg-white/[0.12] transition-colors"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-1.5 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClear}
            className="flex-1 px-2 py-1 text-xs rounded bg-white/[0.08] text-white/60 hover:bg-white/[0.12] transition-colors font-medium"
          >
            Clear Resolution
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
