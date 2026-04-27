import { useCallback } from 'react'
import { commentDraftManager } from '../lib/commentDrafts'

export function useCommentDraft(author: string) {
  const createDraft = useCallback((targetType: string, targetId: string, content: string, replyingTo?: string) => {
    return commentDraftManager.createDraft(targetType, targetId, author, content, replyingTo)
  }, [author])

  const updateDraft = useCallback((draftId: string, content: string) => {
    return commentDraftManager.updateDraft(draftId, content)
  }, [])

  const deleteDraft = useCallback((draftId: string) => {
    return commentDraftManager.deleteDraft(draftId)
  }, [])

  const getDraftsForTarget = useCallback((targetType: string, targetId: string) => {
    return commentDraftManager.getDraftsForTarget(targetType, targetId)
  }, [])

  const getMyDrafts = useCallback(() => {
    return commentDraftManager.getDraftsForAuthor(author)
  }, [author])

  const scheduleDraft = useCallback((draftId: string, scheduledFor: number) => {
    return commentDraftManager.scheduleDraft(draftId, scheduledFor)
  }, [])

  const unscheduleDraft = useCallback((draftId: string) => {
    return commentDraftManager.unscheduleDraft(draftId)
  }, [])

  const markAsClean = useCallback((draftId: string) => {
    return commentDraftManager.markDraftAsClean(draftId)
  }, [])

  const exportDraft = useCallback((draftId: string) => {
    return commentDraftManager.exportDraft(draftId)
  }, [])

  return {
    createDraft,
    updateDraft,
    deleteDraft,
    getDraftsForTarget,
    getMyDrafts,
    scheduleDraft,
    unscheduleDraft,
    markAsClean,
    exportDraft,
  }
}

export function useDraftManager() {
  const getScheduledDrafts = useCallback(() => {
    return commentDraftManager.getScheduledDrafts()
  }, [])

  const getReadyToPublish = useCallback(() => {
    return commentDraftManager.getDraftsReadyToPublish()
  }, [])

  const getAllDrafts = useCallback(() => {
    return commentDraftManager.getAllDrafts()
  }, [])

  const getStats = useCallback(() => {
    return commentDraftManager.getDraftStats()
  }, [])

  const getOldDrafts = useCallback((daysOld: number) => {
    return commentDraftManager.getOldDrafts(daysOld)
  }, [])

  const deleteOldDrafts = useCallback((daysOld: number) => {
    return commentDraftManager.deleteOldDrafts(daysOld)
  }, [])

  return {
    getScheduledDrafts,
    getReadyToPublish,
    getAllDrafts,
    getStats,
    getOldDrafts,
    deleteOldDrafts,
  }
}
