import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import type { TableMapping } from '../../types'
import { suggestMatches } from '../../lib/columnMatching'
import { useTheme } from '../../hooks/useTheme'

interface Props {
  mapping: TableMapping
  onSuggestionAccept?: (sourceCol: string, targetCol: string) => void
  isDark?: boolean
}

export default function UnmatchedColumnsPanel({ mapping, onSuggestionAccept, isDark = true }: Props) {
  const { theme } = useTheme()
  const effectivelyDark = isDark !== false ? (theme === 'dark') : isDark

  const matchedSourceNames = new Set(mapping.column_mappings.map(cm => cm.col_a.name))
  const matchedTargetNames = new Set(mapping.column_mappings.map(cm => cm.col_b.name))

  const unmatchedSource = mapping.table_a.columns.filter(col => !matchedSourceNames.has(col.name))
  const unmatchedTarget = mapping.table_b.columns.filter(col => !matchedTargetNames.has(col.name))

  if (unmatchedSource.length === 0 && unmatchedTarget.length === 0) {
    return null
  }

  return (
    <div className={`rounded-xl border p-4 space-y-4 ${
      effectivelyDark
        ? 'border-amber-500/20 bg-amber-500/[0.06]'
        : 'border-amber-300 bg-amber-100'
    }`}>
      <div className="flex items-start gap-2">
        <Lightbulb className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
          effectivelyDark ? 'text-amber-400' : 'text-amber-600'
        }`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${
            effectivelyDark ? 'text-amber-200' : 'text-amber-900'
          }`}>
            Unmatched columns with suggestions
          </h3>
          <p className={`text-xs mt-1 ${
            effectivelyDark ? 'text-amber-100/70' : 'text-amber-800'
          }`}>
            These columns don't have mappings yet, but we found possible matches
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {unmatchedSource.map((sourceCol) => {
          const suggestions = suggestMatches(
            sourceCol.name,
            sourceCol.data_type?.base_type,
            unmatchedTarget
          )

          return (
            <motion.div
              key={sourceCol.name}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg border p-3 ${
                effectivelyDark
                  ? 'border-amber-500/30 bg-amber-500/10'
                  : 'border-amber-300 bg-amber-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    effectivelyDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {sourceCol.name}
                  </p>
                  <p className={`text-xs ${
                    effectivelyDark ? 'text-white/40' : 'text-slate-600'
                  }`}>
                    {sourceCol.data_type?.base_type || 'unknown'}
                  </p>
                </div>
              </div>

              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.map((suggestion, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center justify-between p-2 rounded border ${
                        effectivelyDark
                          ? 'border-emerald-500/20 bg-emerald-500/10'
                          : 'border-emerald-300 bg-emerald-50'
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${
                          effectivelyDark ? 'text-emerald-200' : 'text-emerald-900'
                        }`}>
                          {suggestion.targetColumn}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] ${
                            effectivelyDark ? 'text-emerald-100/60' : 'text-emerald-800'
                          }`}>
                            {suggestion.reason}
                          </span>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            effectivelyDark
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-emerald-200 text-emerald-700'
                          }`}>
                            {(suggestion.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      {onSuggestionAccept && (
                        <motion.button
                          onClick={() => onSuggestionAccept(sourceCol.name, suggestion.targetColumn)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`ml-2 px-2 py-1 rounded text-xs font-medium transition-colors ${
                            effectivelyDark
                              ? 'bg-emerald-500/30 text-emerald-200 hover:bg-emerald-500/50'
                              : 'bg-emerald-300 text-emerald-900 hover:bg-emerald-400'
                          }`}
                        >
                          Accept
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className={`text-xs ${
                  effectivelyDark ? 'text-white/50' : 'text-slate-600'
                }`}>
                  No suitable matches found
                </p>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
