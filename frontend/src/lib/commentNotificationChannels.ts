export class NotificationChannelManager {
  private channels = new Map<string, Set<string>>()

  subscribe(userId: string, channel: 'email' | 'push' | 'in_app'): void {
    if (!this.channels.has(channel)) this.channels.set(channel, new Set())
    this.channels.get(channel)!.add(userId)
  }

  unsubscribe(userId: string, channel: string): void {
    this.channels.get(channel)?.delete(userId)
  }

  getSubscribedChannels(userId: string): string[] {
    const subscribed: string[] = []
    this.channels.forEach((users, channel) => {
      if (users.has(userId)) subscribed.push(channel)
    })
    return subscribed
  }
}

export const notificationChannelManager = new NotificationChannelManager()
