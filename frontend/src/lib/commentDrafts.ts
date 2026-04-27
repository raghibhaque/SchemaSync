/**
 * Comment drafts and scheduling system
 */

export interface CommentDraft {
  draftId: string
  targetType: string
  targetId: string
  author: string
  content: string
  createdAt: number
  lastModified: number
  replyingTo?: string
  status: 'draft' | 'scheduled'
  scheduledFor?: number
  isDirty: boolean
}

class CommentDraftManager {
  private drafts: Map<string, CommentDraft> = new Map()
  private scheduledDrafts: Map<string, CommentDraft> = new Map()
  private nextDraftId = 0

  createDraft(targetType: string, targetId: string, author: string, content: string, replyingTo?: string): CommentDraft {
    const draft: CommentDraft = {
      draftId: `draft-${++this.nextDraftId}`,
      targetType,
      targetId,
      author,
      content,
      createdAt: Date.now(),
      lastModified: Date.now(),
      replyingTo,
      status: 'draft',
      isDirty: false
    }

    this.drafts.set(draft.draftId, draft)
    return draft
  }

  getDraft(draftId: string): CommentDraft | null {
    return this.drafts.get(draftId) || null
  }

  updateDraft(draftId: string, content: string): CommentDraft | null {
    const draft = this.drafts.get(draftId)
    if (!draft) return null

    draft.content = content
    draft.lastModified = Date.now()
    draft.isDirty = true
    return draft
  }

  deleteDraft(draftId: string): boolean {
    return this.drafts.delete(draftId) || this.scheduledDrafts.delete(draftId)
  }

  getDraftsForTarget(targetType: string, targetId: string): CommentDraft[] {
    return Array.from(this.drafts.values())
      .filter(d => d.targetType === targetType && d.targetId === targetId && d.status === 'draft')
      .sort((a, b) => b.lastModified - a.lastModified)
  }

  getDraftsForAuthor(author: string): CommentDraft[] {
    return Array.from(this.drafts.values())
      .filter(d => d.author === author && d.status === 'draft')
      .sort((a, b) => b.lastModified - a.lastModified)
  }

  scheduleDraft(draftId: string, scheduledFor: number): CommentDraft | null {
    const draft = this.drafts.get(draftId)
    if (!draft) return null

    draft.status = 'scheduled'
    draft.scheduledFor = scheduledFor
    this.drafts.delete(draftId)
    this.scheduledDrafts.set(draftId, draft)
    return draft
  }

  unscheduleDraft(draftId: string): CommentDraft | null {
    const draft = this.scheduledDrafts.get(draftId)
    if (!draft) return null

    draft.status = 'draft'
    draft.scheduledFor = undefined
    this.scheduledDrafts.delete(draftId)
    this.drafts.set(draftId, draft)
    return draft
  }

  getScheduledDrafts(): CommentDraft[] {
    return Array.from(this.scheduledDrafts.values())
      .sort((a, b) => (a.scheduledFor || 0) - (b.scheduledFor || 0))
  }

  getDraftsReadyToPublish(): CommentDraft[] {
    const now = Date.now()
    return Array.from(this.scheduledDrafts.values())
      .filter(d => d.scheduledFor && d.scheduledFor <= now)
      .sort((a, b) => (a.scheduledFor || 0) - (b.scheduledFor || 0))
  }

  getAllDrafts(): CommentDraft[] {
    return Array.from(this.drafts.values())
      .concat(Array.from(this.scheduledDrafts.values()))
      .sort((a, b) => b.lastModified - a.lastModified)
  }

  markDraftAsClean(draftId: string): CommentDraft | null {
    const draft = this.drafts.get(draftId) || this.scheduledDrafts.get(draftId)
    if (draft) {
      draft.isDirty = false
    }
    return draft || null
  }

  getDraftStats(): {
    totalDrafts: number
    unsavedCount: number
    scheduledCount: number
    readyToPublish: number
  } {
    const allDrafts = this.getAllDrafts()
    const unsaved = allDrafts.filter(d => d.isDirty).length
    const scheduled = this.getScheduledDrafts().length
    const ready = this.getDraftsReadyToPublish().length

    return {
      totalDrafts: allDrafts.length,
      unsavedCount: unsaved,
      scheduledCount: scheduled,
      readyToPublish: ready
    }
  }

  getOldDrafts(daysOld: number): CommentDraft[] {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000)
    return this.getAllDrafts().filter(d => d.lastModified < cutoff)
  }

  deleteOldDrafts(daysOld: number): number {
    const oldDrafts = this.getOldDrafts(daysOld)
    let count = 0

    oldDrafts.forEach(draft => {
      if (this.deleteDraft(draft.draftId)) {
        count++
      }
    })

    return count
  }

  exportDraft(draftId: string): string | null {
    const draft = this.getDraft(draftId)
    if (!draft) return null

    return JSON.stringify(draft, null, 2)
  }
}

export const commentDraftManager = new CommentDraftManager()
