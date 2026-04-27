import { Bell, Trash2, Check } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { useState } from 'react'

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getIconColor = (type: string) => {
    switch (type) {
      case 'mention':
        return 'text-blue-400'
      case 'reply':
        return 'text-indigo-400'
      case 'resolve':
        return 'text-emerald-400'
      case 'reaction':
        return 'text-yellow-400'
      default:
        return 'text-white/40'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded hover:bg-white/[0.08] transition-colors"
        title="Notifications"
      >
        <Bell size={18} className="text-white/60" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 max-h-96 overflow-y-auto rounded-lg border border-white/[0.1] bg-[#0f0f1e]/95 backdrop-blur-xl shadow-2xl z-50">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-white/[0.1] bg-[#0f0f1e] px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications list */}
          {notifications.length > 0 ? (
            <div className="divide-y divide-white/[0.05]">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 hover:bg-white/[0.05] transition-colors ${!notif.is_read ? 'bg-indigo-500/10' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${getIconColor(notif.type)}`}>
                      {notif.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 truncate">
                        <span className="font-semibold">{notif.user}</span> {notif.type === 'mention' ? 'mentioned you' : notif.type === 'reply' ? 'replied' : notif.type === 'resolve' ? 'resolved' : 'reacted to'} a comment
                      </p>
                      <p className="mt-1 text-[10px] text-white/50 line-clamp-2">
                        {notif.content}
                      </p>
                      <p className="mt-1 text-[10px] text-white/30">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!notif.is_read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="p-1 rounded hover:bg-white/[0.1] transition-colors"
                          title="Mark as read"
                        >
                          <Check size={12} className="text-white/40" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1 rounded hover:bg-white/[0.1] transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} className="text-white/40" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-white/40">No notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
