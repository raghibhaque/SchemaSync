import { motion, AnimatePresence } from 'framer-motion'
import { History, Trash2, CheckCircle2, Circle, Undo2, Redo2 } from 'lucide-react'
import type { HistoryEntry } from '../../hooks/useHistory'
import { useTheme } from '../../hooks/useTheme'

interface Props {
  history: HistoryEntry[]
  onClearHistory: () => void
  isDark?: boolean
}

export default function HistoryPanel({ history, onClearHistory, isDark = true }: Props) {
  const { theme } = useTheme()
  const effectivelyDark = isDark !== false ? (theme === 'dark') : isDark

  const getActionIcon = (actionType: HistoryEntry['actionType']) => {
    switch (actionType) {
      case 'reviewed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      case 'unreviewed':
        return <Circle className="h-4 w-4 text-amber-400" />
      case 'suggestion_accepted':
        return <CheckCircle2 className="h-4 w-4 text-indigo-400" />
      case 'template_loaded':
        return <History className="h-4 w-4 text-cyan-400" />
      case 'undo':
        return <Undo2 className="h-4 w-4 text-violet-400" />
      case 'redo':
        return <Redo2 className="h-4 w-4 text-violet-400" />
      default:
        return <Circle className="h-4 w-4 text-white/40" />
    }
  }

  const getActionLabel = (actionType: HistoryEntry['actionType']) => {
    switch (actionType) {
      case 'reviewed':
        return 'Marked as reviewed'
      case 'unreviewed':
        return 'Marked as unreviewed'
      case 'suggestion_accepted':
        return 'Accepted suggestion'
      case 'template_loaded':
        return 'Loaded template'
      case 'expanded':
        return 'Expanded mapping'
      case 'collapsed':
        return 'Collapsed mapping'
      case 'undo':
        return 'Undid action'
      case 'redo':
        return 'Redid action'
      default:
        return actionType
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - timestamp

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${
      effectivelyDark
        ? 'border-white/[0.07] bg-white/[0.03]'
        : 'border-slate-300 bg-slate-100'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className={`h-5 w-5 ${
            effectivelyDark ? 'text-indigo-400' : 'text-indigo-600'
          }`} />
          <h3 className={`font-semibold ${
            effectivelyDark ? 'text-white/80' : 'text-slate-900'
          }`}>
            History
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            effectivelyDark
              ? 'bg-white/[0.1] text-white/60'
              : 'bg-slate-300 text-slate-700'
          }`}>
            {history.length}
          </span>
        </div>

        <motion.button
          onClick={() => {
            if (confirm('Clear all history? This cannot be undone.')) {
              onClearHistory()
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-1 rounded transition-colors ${
            effectivelyDark
              ? 'text-white/40 hover:text-red-400 hover:bg-white/[0.05]'
              : 'text-slate-600 hover:text-red-600 hover:bg-slate-200'
          }`}
          title="Clear history"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>

      {history.length === 0 ? (
        <div className={`text-center py-8 text-sm ${
          effectivelyDark ? 'text-white/40' : 'text-slate-500'
        }`}>
          <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>No history yet. Start reviewing mappings to see changes here.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {history.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: i * 0.02 }}
                className={`flex gap-3 p-2 rounded-lg border transition-colors ${
                  effectivelyDark
                    ? 'border-white/[0.05] hover:bg-white/[0.03]'
                    : 'border-slate-300 hover:bg-slate-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActionIcon(entry.actionType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-xs font-medium ${
                      effectivelyDark ? 'text-white/80' : 'text-slate-900'
                    }`}>
                      {getActionLabel(entry.actionType)}
                    </span>
                    <span className={`text-[11px] ${
                      effectivelyDark ? 'text-white/40' : 'text-slate-600'
                    }`}>
                      {entry.tableName}
                    </span>
                  </div>
                  {entry.description && (
                    <p className={`text-xs mt-0.5 ${
                      effectivelyDark ? 'text-white/50' : 'text-slate-600'
                    }`}>
                      {entry.description}
                    </p>
                  )}
                  <span className={`text-[10px] mt-1 block ${
                    effectivelyDark ? 'text-white/30' : 'text-slate-500'
                  }`}>
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
