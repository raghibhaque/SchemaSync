import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, AlertTriangle } from 'lucide-react'
import type { TableMapping } from '../../types'
import { cn } from '@/lib/utils'
import ConfidenceBadge from '../shared/ConfidenceBadge'

interface Props {
  mapping: TableMapping | null
  onClose: () => void
}

export default function ColumnDetailsDrawer({ mapping, onClose }: Props) {
  if (!mapping) return null

  return (
    <AnimatePresence>
      {mapping && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0a0a12] border-l border-white/[0.07] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 border-b border-white/[0.07] bg-[#06060e]/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white/80">Column Mappings</h2>
                <p className="mt-1 text-xs text-white/40">
                  {mapping.table_a.name} → {mapping.table_b.name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white/60 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              {mapping.column_mappings.length === 0 ? (
                <p className="text-sm text-white/30">No column mappings found</p>
              ) : (
                mapping.column_mappings.map((col, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors"
                  >
                    {/* Column names */}
                    <div className="space-y-2 mb-3">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Source</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-medium text-indigo-300">
                            {col.col_a.name}
                          </code>
                          <span className="text-xs text-white/25 bg-white/[0.05] rounded px-1.5 py-0.5">
                            {col.col_a.data_type.base_type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center text-white/20">
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </div>

                      <div>
                        <p className="text-xs text-white/40 mb-1">Target</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-medium text-violet-300">
                            {col.col_b.name}
                          </code>
                          <span className="text-xs text-white/25 bg-white/[0.05] rounded px-1.5 py-0.5">
                            {col.col_b.data_type.base_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                      <span className="text-xs text-white/40">Confidence</span>
                      <ConfidenceBadge value={col.confidence} size="sm" showPercent={true} />
                    </div>

                    {/* Conflicts */}
                    {col.conflicts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                          <span className="text-xs font-medium text-white/60">
                            {col.conflicts.length} conflict{col.conflicts.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {col.conflicts.map((conflict: any, ci) => (
                            <div
                              key={ci}
                              className={cn(
                                'text-xs p-2 rounded',
                                conflict.severity === 'error'
                                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300/80'
                                  : conflict.severity === 'warning'
                                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300/80'
                                    : 'bg-blue-500/10 border border-blue-500/20 text-blue-300/80'
                              )}
                            >
                              <p className="font-medium">{conflict.message}</p>
                              {conflict.details && (
                                <p className="mt-1 text-[11px] opacity-75">{conflict.details}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
