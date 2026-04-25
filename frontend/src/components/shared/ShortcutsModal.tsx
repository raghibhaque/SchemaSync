import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !isOpen) {
        setIsOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const shortcuts = [
    { keys: ['?'], description: 'Show this help menu' },
    { keys: ['Cmd/Ctrl', '+', 'K'], description: 'Focus search in mappings' },
    { keys: ['Esc'], description: 'Clear search / Close dialogs' },
  ]

  return (
    <>
      {/* Floating help button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 rounded-full border border-white/[0.08] bg-white/[0.06] p-3 text-white/50 hover:border-white/[0.14] hover:bg-white/[0.1] hover:text-white/80 transition-all"
        title="Show keyboard shortcuts (press ?)"
      >
        <Keyboard className="h-5 w-5" />
      </motion.button>

      {/* Modal backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="rounded-xl border border-white/[0.12] bg-[#0a0a12]/95 p-6 shadow-xl max-w-sm w-full mx-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/40 hover:text-white/60 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Shortcuts list */}
              <div className="space-y-3">
                {shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 pb-3 border-b border-white/[0.06] last:border-b-0 last:pb-0">
                    <div className="flex gap-1.5 flex-wrap">
                      {shortcut.keys.map((key, ki) => (
                        <kbd
                          key={ki}
                          className={cn(
                            'px-2 py-1 rounded text-xs font-semibold',
                            'border border-white/[0.12] bg-white/[0.06] text-white/80',
                            'shadow-sm'
                          )}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                    <span className="text-xs text-white/50">{shortcut.description}</span>
                  </div>
                ))}
              </div>

              {/* Footer hint */}
              <div className="mt-6 text-center text-xs text-white/30">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.12] text-white/60">Esc</kbd> to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
