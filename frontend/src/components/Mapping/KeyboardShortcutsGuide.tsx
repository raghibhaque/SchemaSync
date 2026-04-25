import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutGroup {
  category: string
  shortcuts: Array<{
    keys: string[]
    description: string
    emoji: string
  }>
}

export default function KeyboardShortcutsGuide({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'features'>('shortcuts')

  const shortcutGroups: ShortcutGroup[] = [
    {
      category: 'Navigation & Search',
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Focus search bar', emoji: '🔍' },
        { keys: ['/'], description: 'Quick search', emoji: '⚡' },
        { keys: ['Esc'], description: 'Clear search and close panels', emoji: '❌' },
        { keys: ['↓', '↑'], description: 'Navigate mappings', emoji: '⬆️' },
      ],
    },
    {
      category: 'Undo & Redo',
      shortcuts: [
        { keys: ['Ctrl', 'Z'], description: 'Undo last action', emoji: '↶' },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo action', emoji: '↷' },
        { keys: ['Ctrl', 'Y'], description: 'Redo (alternative)', emoji: '↷' },
      ],
    },
    {
      category: 'Batch Operations',
      shortcuts: [
        { keys: ['Select', 'All'], description: 'Select all visible mappings', emoji: '☑️' },
        { keys: ['Select', 'High Conf'], description: 'Select high confidence mappings', emoji: '⭐' },
        { keys: ['Bulk', 'Review'], description: 'Mark selected as reviewed', emoji: '✓' },
      ],
    },
  ]

  const features = [
    {
      title: 'Undo/Redo System',
      description: 'Never lose work - undo/redo any action with history visualization',
      shortcuts: ['Ctrl+Z', 'Ctrl+Shift+Z'],
      emoji: '↶',
    },
    {
      title: 'Batch Conflict Resolution',
      description: 'Group similar conflicts and resolve them in patterns, not one-by-one',
      shortcuts: ['Find by type', 'Auto-resolve'],
      emoji: '⚡',
    },
    {
      title: 'Smart Filtering',
      description: 'Advanced multi-criteria filters with AND/OR logic for precision',
      shortcuts: ['Type mismatch', 'Quick wins'],
      emoji: '🔍',
    },
    {
      title: 'Auto-Discovery Dashboard',
      description: 'Prioritized work items - critical, high priority, and completion stats',
      shortcuts: ['Click cards', 'Auto-apply'],
      emoji: '📊',
    },
    {
      title: 'Smart Suggestions',
      description: 'Intelligent column matching using name similarity and type compatibility',
      shortcuts: ['Auto-suggest', 'Accept/Reject'],
      emoji: '💡',
    },
    {
      title: 'Performance Metrics',
      description: 'Real-time execution times, table counts, and confidence analytics',
      shortcuts: ['View metrics', 'Export'],
      emoji: '📈',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.08] to-white/[0.04] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <Keyboard className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts & Features Guide</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-1 rounded text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.08] px-6 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('shortcuts')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'shortcuts'
                  ? 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              Keyboard Shortcuts
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('features')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'features'
                  ? 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              Features Overview
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {activeTab === 'shortcuts' && (
              <>
                {shortcutGroups.map((group, i) => (
                  <motion.div
                    key={group.category}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <h3 className="text-sm font-semibold text-white mb-3">{group.category}</h3>
                    <div className="space-y-2">
                      {group.shortcuts.map((shortcut) => (
                        <div key={shortcut.description} className="flex items-center gap-3 p-2 rounded bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                          <span className="text-lg">{shortcut.emoji}</span>
                          <div className="flex-1">
                            <p className="text-xs text-white/80">{shortcut.description}</p>
                          </div>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key) => (
                              <kbd key={key} className="px-2 py-1 rounded text-xs bg-white/[0.1] border border-white/[0.15] text-white/70 font-mono">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </>
            )}

            {activeTab === 'features' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl">{feature.emoji}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">{feature.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-white/60 mb-3">{feature.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {feature.shortcuts.map((s) => (
                        <span key={s} className="text-[10px] bg-white/[0.1] text-white/60 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.08] px-6 py-4 text-center text-xs text-white/50">
            💡 Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.1] font-mono">?</kbd> anytime to open this guide
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
