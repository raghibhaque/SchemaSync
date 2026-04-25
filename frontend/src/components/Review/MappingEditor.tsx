import { motion, AnimatePresence } from 'framer-motion'
import { Save, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { TableMapping } from '../../types'

interface Props {
  mapping: TableMapping
  isOpen: boolean
  onClose: () => void
  onSave: (sourceId: string, targetId: string) => void
}

export default function MappingEditor({ mapping, isOpen, onClose, onSave }: Props) {
  const [selectedSourceId, setSelectedSourceId] = useState(
    mapping.column_mappings?.[0]?.col_a?.name || ''
  )
  const [selectedTargetId, setSelectedTargetId] = useState(
    mapping.column_mappings?.[0]?.col_b?.name || ''
  )

  if (!isOpen) return null

  const sourceColumns = mapping.table_a.columns
  const targetColumns = mapping.table_b.columns
  const currentMapping = mapping.column_mappings?.[0]

  const handleSave = () => {
    onSave(selectedSourceId, selectedTargetId)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/[0.1] rounded-lg max-w-md w-full p-5 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Edit Mapping</h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/[0.1] transition-colors"
            >
              <X className="h-5 w-5 text-white/60" />
            </button>
          </div>

          {/* Current Mapping Info */}
          {currentMapping && (
            <div className="text-xs text-white/50 space-y-1 p-2 bg-white/[0.02] rounded">
              <p>
                <span className="text-white/70">Current:</span> {currentMapping.col_a?.name} →
                {currentMapping.col_b?.name}
              </p>
              <p>
                <span className="text-white/70">Confidence:</span>{' '}
                {Math.round(currentMapping.confidence * 100)}%
              </p>
            </div>
          )}

          {/* Source Column Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">Source Column</label>
            <select
              value={selectedSourceId}
              onChange={e => setSelectedSourceId(e.target.value)}
              className={cn(
                'w-full px-3 py-2 rounded-lg border bg-white/[0.05]',
                'border-white/[0.1] text-white text-sm',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500'
              )}
            >
              <option value="">Select source column...</option>
              {sourceColumns.map(col => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.data_type?.base_type || 'unknown'})
                </option>
              ))}
            </select>
          </div>

          {/* Target Column Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">Target Column</label>
            <select
              value={selectedTargetId}
              onChange={e => setSelectedTargetId(e.target.value)}
              className={cn(
                'w-full px-3 py-2 rounded-lg border bg-white/[0.05]',
                'border-white/[0.1] text-white text-sm',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500'
              )}
            >
              <option value="">Select target column...</option>
              {targetColumns.map(col => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.data_type?.base_type || 'unknown'})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!selectedSourceId || !selectedTargetId}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
                'text-sm font-medium transition-all',
                selectedSourceId && selectedTargetId
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-white/[0.05] border border-white/[0.1] text-white/50 cursor-not-allowed'
              )}
            >
              <Save className="h-4 w-4" />
              Save
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-3 py-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] text-sm font-medium text-white/70 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
