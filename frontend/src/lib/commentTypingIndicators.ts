export class TypingIndicatorManager {
  private typing = new Map<string, Set<string>>()

  setTyping(commentId: string, userId: string): void {
    if (!this.typing.has(commentId)) this.typing.set(commentId, new Set())
    this.typing.get(commentId)!.add(userId)
    setTimeout(() => this.clearTyping(commentId, userId), 3000)
  }

  clearTyping(commentId: string, userId: string): void {
    this.typing.get(commentId)?.delete(userId)
  }

  getTypingUsers(commentId: string): string[] {
    return Array.from(this.typing.get(commentId) || [])
  }

  isAnyoneTyping(commentId: string): boolean {
    return (this.typing.get(commentId)?.size || 0) > 0
  }
}

export const typingIndicatorManager = new TypingIndicatorManager()
