import { useState } from 'react'
import { MessageCircle, Check, Trash2, Heart, Send } from 'lucide-react'
import type { CommentThread as CommentThreadType, Comment } from '../../lib/comments'
import { useComments } from '../../hooks/useComments'

function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })
}

interface Props {
  thread: CommentThreadType
  target_type: 'mapping' | 'conflict' | 'suggestion' | 'column'
  target_id: string
  onThreadChange?: () => void
}

export default function CommentThread({ thread, target_type, target_id, onThreadChange }: Props) {
  const { resolveComment, addReaction, removeReaction, addReply, deleteComment } = useComments(target_type, target_id)
  const [replyText, setReplyText] = useState('')
  const [showReplies, setShowReplies] = useState(false)

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (replyText.trim()) {
      addReply(thread.root.id, replyText)
      setReplyText('')
      onThreadChange?.()
    }
  }

  const handleResolve = () => {
    resolveComment(thread.root.id)
    onThreadChange?.()
  }

  const handleReaction = (emoji: string, comment: Comment) => {
    const hasReaction = comment.reactions[emoji]?.includes('current-user') ?? false
    if (hasReaction) {
      removeReaction(comment.id, emoji)
    } else {
      addReaction(comment.id, emoji)
    }
    onThreadChange?.()
  }

  const handleDelete = (commentId: string) => {
    deleteComment(commentId)
    onThreadChange?.()
  }

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`space-y-2 ${isReply ? 'ml-6 mt-3 border-l border-white/[0.1] pl-4' : 'mb-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-500/30 flex items-center justify-center">
              <span className="text-[10px] font-bold text-indigo-300">
                {comment.author[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{comment.author}</p>
              <p className="text-[10px] text-white/40">
                {formatTime(comment.created_at)}
              </p>
            </div>
          </div>
        </div>
        {comment.is_resolved && (
          <div className="flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5">
            <Check size={12} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-300">Resolved</span>
          </div>
        )}
      </div>

      <p className="text-xs text-white/80 leading-relaxed">{comment.content}</p>

      {Object.keys(comment.reactions).length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {Object.entries(comment.reactions).map(([emoji, users]) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji, comment)}
              className="flex items-center gap-0.5 rounded bg-white/[0.08] px-1.5 py-0.5 hover:bg-white/[0.12] transition-colors"
              title={users.join(', ')}
            >
              <span className="text-xs">{emoji}</span>
              <span className="text-[10px] text-white/50">{users.length}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-2">
        <button
          onClick={() => handleReaction('👍', comment)}
          className="text-[10px] text-white/40 hover:text-white/60 transition-colors flex items-center gap-1"
        >
          <Heart size={12} />
          React
        </button>
        {!isReply && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-[10px] text-white/40 hover:text-white/60 transition-colors flex items-center gap-1"
          >
            <MessageCircle size={12} />
            {thread.replies.length} replies
          </button>
        )}
        {!comment.is_resolved && (
          <button
            onClick={handleResolve}
            className="text-[10px] text-white/40 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <Check size={12} />
            Resolve
          </button>
        )}
        <button
          onClick={() => handleDelete(comment.id)}
          className="text-[10px] text-white/40 hover:text-rose-400 transition-colors flex items-center gap-1"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      {renderComment(thread.root)}

      {showReplies && thread.replies.length > 0 && (
        <div className="space-y-2">
          {thread.replies.map(reply => renderComment(reply, true))}
        </div>
      )}

      {!thread.root.is_resolved && (
        <form onSubmit={handleAddReply} className="flex gap-2 mt-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 text-xs bg-white/[0.05] border border-white/[0.1] rounded px-2 py-1.5 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="p-1.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      )}
    </div>
  )
}
