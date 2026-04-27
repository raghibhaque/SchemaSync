import { useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { useComments } from '../../hooks/useComments'
import CommentThread from './CommentThread'

interface Props {
  tableA: string
  tableB: string
}

export default function MappingComments({ tableA, tableB }: Props) {
  const target_id = `${tableA}-${tableB}`
  const { threads, stats, addComment } = useComments('mapping', target_id)
  const [commentText, setCommentText] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (commentText.trim()) {
      addComment(commentText)
      setCommentText('')
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-2 rounded hover:bg-white/[0.05] transition-colors"
      >
        <MessageCircle size={14} className="text-white/60" />
        <span className="text-xs font-medium text-white/60">
          Comments ({stats.total})
        </span>
        {stats.resolved > 0 && (
          <span className="text-xs text-emerald-400">
            {stats.resolved} resolved
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="space-y-3 pt-2">
          {/* Comment threads */}
          {threads.length > 0 ? (
            threads.map((thread) => (
              <CommentThread
                key={thread.root.id}
                thread={thread}
                target_type="mapping"
                target_id={target_id}
              />
            ))
          ) : (
            <p className="text-xs text-white/40 text-center py-4">
              No comments yet. Be the first to share feedback!
            </p>
          )}

          {/* New comment form */}
          <form onSubmit={handleAddComment} className="flex gap-2 mt-3 pt-3 border-t border-white/[0.1]">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-xs bg-white/[0.05] border border-white/[0.1] rounded px-2 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-50 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
