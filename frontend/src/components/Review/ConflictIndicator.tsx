import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { ColumnMapping } from '../../types'

interface Props {
  mapping: ColumnMapping
  expanded?: boolean
  onToggle?: () => void
}

export default function ConflictIndicator({ mapping, expanded: controlledExpanded, onToggle }: Props) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded

  const hasConflicts = mapping.conflicts && mapping.conflicts.length > 0

  if (!hasConflicts) {
    return null
  }

  const toggleExpanded = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalExpanded(!internalExpanded)
    }
  }

  return (
    <motion.div className="space-y-2">
      {/* Conflict Indicator Button */}
      <motion.button
        onClick={toggleExpanded}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
      >
        <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-amber-300">
            {mapping.conflicts!.length} conflict{mapping.conflicts!.length !== 1 ? 's' : ''} detected
          </p>
          <p className="text-xs text-amber-200/70">
            {mapping.col_a?.name} → {mapping.col_b?.name}
          </p>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-amber-400" />
        </motion.div>
      </motion.button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              {mapping.conflicts!.map((conflict, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-xs space-y-1"
                >
                  {/* Conflict Type */}
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-300">
                        {conflict.type || 'Type Mismatch'}
                      </p>
                      {conflict.description && (
                        <p className="text-amber-200/70 mt-0.5">{conflict.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Conflict Details */}
                  {(conflict.source || conflict.target) && (
                    <div className="ml-4 text-amber-200/60 text-xs space-y-1 pt-1">
                      {conflict.source && (
                        <p>
                          <span className="text-amber-300">Source:</span> {conflict.source}
                        </p>
                      )}
                      {conflict.target && (
                        <p>
                          <span className="text-amber-300">Target:</span> {conflict.target}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Severity Badge */}
                  {conflict.severity && (
                    <div className="ml-4 pt-1">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          conflict.severity === 'high'
                            ? 'bg-rose-500/20 text-rose-300'
                            : conflict.severity === 'medium'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {conflict.severity.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {i < mapping.conflicts!.length - 1 && (
                    <div className="my-2 border-t border-amber-500/20" />
                  )}
                </motion.div>
              ))}

              {/* Resolution Note */}
              <div className="mt-3 pt-2 border-t border-amber-500/20">
                <p className="text-xs text-amber-200/60 italic">
                  Consider editing this mapping or rejecting it if the conflicts cannot be resolved.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
