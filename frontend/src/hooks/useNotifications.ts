import { useState, useEffect, useCallback } from 'react'
import { notificationManager, type Notification } from '../lib/notifications'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationManager.subscribe((notifs) => {
      setNotifications(notifs)
      setUnreadCount(notificationManager.getUnreadCount())
    })

    // Get initial state
    setNotifications(notificationManager.getAll())
    setUnreadCount(notificationManager.getUnreadCount())

    return unsubscribe
  }, [])

  const markAsRead = useCallback((id: string) => {
    notificationManager.markAsRead(id)
  }, [])

  const markAllAsRead = useCallback(() => {
    notificationManager.markAllAsRead()
  }, [])

  const deleteNotification = useCallback((id: string) => {
    notificationManager.deleteNotification(id)
  }, [])

  const addMentionNotification = useCallback((user: string, comment_id: string, target_type: string, target_id: string, content: string) => {
    notificationManager.addNotification('mention', user, comment_id, target_type, target_id, content)
  }, [])

  const addReplyNotification = useCallback((user: string, comment_id: string, target_type: string, target_id: string, content: string) => {
    notificationManager.addNotification('reply', user, comment_id, target_type, target_id, content)
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addMentionNotification,
    addReplyNotification,
  }
}
