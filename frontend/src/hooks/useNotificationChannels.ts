import { useCallback } from 'react'
import { notificationChannelManager } from '../lib/commentNotificationChannels'

export function useNotificationChannels(userId: string) {
  const subscribe = useCallback((channel: any) => notificationChannelManager.subscribe(userId, channel), [userId])
  const getChannels = useCallback(() => notificationChannelManager.getSubscribedChannels(userId), [userId])
  return {subscribe, getChannels}
}
