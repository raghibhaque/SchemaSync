import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, RotateCw, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { UndoRedoAction } from '../../hooks/useUndoRedo'

interface Props {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  history: UndoRedoAction[]
  currentIndex: number
}

export default function UndoRedoBar({ canUndo, canRedo, onUndo, onRedo, history, currentIndex }: Props) {
  const [showHistory, setShowHistory] = useState(false)

  const getActionEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      mark_reviewed: '✓',
      mark_unreviewed: '↺',
      bulk_select: '☑️',
      conflict_resolved: '🔧',
      note_added: '📝',
      rule_applied: '⚙️',
      template_loaded: '📋',
      filter_applied: '🔍',
      snapshot: '💾',
    }
    return emojiMap[type] || '•'
  }

  const truncateDescription = (desc: string, maxLen: number = 40) => {
    return desc.length > maxLen ? desc.substring(0, maxLen) + '...' : desc
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Undo Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            canUndo
              ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 cursor-pointer'
              : 'bg-white/[0.05] text-white/30 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Undo
        </motion.button>

        {/* Redo Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            canRedo
              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer'
              : 'bg-white/[0.05] text-white/30 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Shift+Z)"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Redo
        </motion.button>

        {/* History Dropdown */}
        {history.length > 0 && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.05] text-white/60 hover:bg-white/[0.08] transition-all"
            >
              <span>History ({currentIndex})</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 mt-2 w-72 max-h-96 rounded-lg border border-white/[0.1] bg-gradient-to-b from-white/[0.08] to-white/[0.04] overflow-y-auto z-50 shadow-2xl"
                >
                  <div className="p-2 space-y-1">
                    {history.map((action, index) => (
                      <motion.div
                        key={action.id || index}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-2 rounded text-xs transition-all ${
                          index === currentIndex - 1
                            ? 'bg-indigo-500/20 border border-indigo-500/30'
                            : 'bg-white/[0.05] hover:bg-white/[0.08] border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg flex-shrink-0">{getActionEmoji(action.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 font-medium truncate">{truncateDescription(action.description)}</p>
                            <p className="text-white/30 text-[10px] mt-0.5">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
