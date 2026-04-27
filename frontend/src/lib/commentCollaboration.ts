export class CommentCollaborationTracker {
  private collaborators = new Map<string, Set<string>>()

  addCollaborator(commentId: string, userId: string): void {
    if (!this.collaborators.has(commentId)) {
      this.collaborators.set(commentId, new Set())
    }
    this.collaborators.get(commentId)!.add(userId)
  }

  getCollaborators(commentId: string): string[] {
    return Array.from(this.collaborators.get(commentId) || [])
  }

  getCollaborationCount(commentId: string): number {
    return this.collaborators.get(commentId)?.size || 0
  }

  isCollaborator(commentId: string, userId: string): boolean {
    return this.collaborators.get(commentId)?.has(userId) || false
  }
}

export const commentCollaborationTracker = new CommentCollaborationTracker()
