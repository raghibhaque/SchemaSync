import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Check } from 'lucide-react'
import { useState } from 'react'
import type { MappingNote } from '../../hooks/useMappingNotes'

interface Props {
  note?: MappingNote
  onAddNote: (text: string) => void
  onUpdateNote: (text: string) => void
  onDeleteNote: () => void
  compact?: boolean
}

export default function MappingNotesPanel({
  note,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  compact = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(note?.text || '')

  const handleSave = () => {
    const trimmed = editText.trim()
    if (!trimmed) {
      if (note) onDeleteNote()
      setIsEditing(false)
      return
    }

    if (note) {
      onUpdateNote(trimmed)
    } else {
      onAddNote(trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditText(note?.text || '')
    setIsEditing(false)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (compact && !note && !isEditing) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsEditing(true)}
        className="p-1 text-white/40 hover:text-indigo-400 transition-colors"
        title="Add note"
      >
        <MessageSquare className="h-4 w-4" />
      </motion.button>
    )
  }

  return (
    <div className="space-y-2">
      {/* Existing note display */}
      {note && !isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/80 break-words whitespace-pre-wrap">{note.text}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-indigo-500/10">
            <span className="text-[10px] text-white/40">{formatTime(note.timestamp)}</span>
            <div className="flex gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="px-2 py-1 text-xs rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDeleteNote}
                className="px-2 py-1 text-xs rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
              >
                Delete
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Edit/Create mode */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-2"
          >
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Add a note about this mapping..."
              className="w-full text-xs rounded bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/30 p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors font-medium"
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="flex-1 px-3 py-1.5 text-xs rounded bg-white/[0.08] text-white/60 hover:bg-white/[0.12] transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add note button when not editing and no note exists */}
      {!note && !isEditing && !compact && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/15 transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Add Note
        </motion.button>
      )}
    </div>
  )
}
