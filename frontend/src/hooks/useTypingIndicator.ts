import { useCallback } from 'react'
import { typingIndicatorManager } from '../lib/commentTypingIndicators'

export function useTypingIndicator(commentId: string, userId: string) {
  const setTyping = useCallback(() => typingIndicatorManager.setTyping(commentId, userId), [commentId, userId])
  const getTyping = useCallback(() => typingIndicatorManager.getTypingUsers(commentId), [commentId])
  return {setTyping, getTyping}
}
