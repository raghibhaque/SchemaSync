/**
 * Comment Notification System
 * Tracks mentions and unread comments
 */

export interface Notification {
  id: string
  type: 'mention' | 'reply' | 'resolve' | 'reaction'
  user: string
  comment_id: string
  target_type: string
  target_id: string
  content: string
  created_at: number
  is_read: boolean
}

class NotificationManager {
  private notifications: Map<string, Notification> = new Map()
  private nextId = 0
  private subscribers: Set<(notifications: Notification[]) => void> = new Set()

  addNotification(type: Notification['type'], user: string, comment_id: string, target_type: string, target_id: string, content: string): Notification {
    const id = `notif-${++this.nextId}`
    const notification: Notification = {
      id,
      type,
      user,
      comment_id,
      target_type,
      target_id,
      content,
      created_at: Date.now(),
      is_read: false,
    }

    this.notifications.set(id, notification)
    this.notifySubscribers()
    return notification
  }

  getUnread(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => !n.is_read)
  }

  markAsRead(id: string): void {
    const notif = this.notifications.get(id)
    if (notif) {
      notif.is_read = true
      this.notifySubscribers()
    }
  }

  markAllAsRead(): void {
    for (const notif of this.notifications.values()) {
      notif.is_read = true
    }
    this.notifySubscribers()
  }

  deleteNotification(id: string): void {
    this.notifications.delete(id)
    this.notifySubscribers()
  }

  getAll(): Notification[] {
    return Array.from(this.notifications.values()).sort((a, b) => b.created_at - a.created_at)
  }

  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notifySubscribers(): void {
    const all = this.getAll()
    this.subscribers.forEach(cb => cb(all))
  }

  getUnreadCount(): number {
    return this.getUnread().length
  }
}

export const notificationManager = new NotificationManager()
