import { useState, useEffect, useCallback } from 'react'
import { commentTemplateManager, type CommentTemplate } from '../lib/commentTemplates'

export function useCommentTemplates() {
  const [templates, setTemplates] = useState<CommentTemplate[]>([])

  useEffect(() => {
    setTemplates(commentTemplateManager.getAllTemplates())

    const unsubscribe = commentTemplateManager.subscribe((updated) => {
      setTemplates(updated)
    })

    return unsubscribe
  }, [])

  const createTemplate = useCallback((name: string, content: string, category: string) => {
    return commentTemplateManager.createTemplate(name, content, category)
  }, [])

  const updateTemplate = useCallback((id: string, updates: Partial<CommentTemplate>) => {
    return commentTemplateManager.updateTemplate(id, updates)
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    return commentTemplateManager.deleteTemplate(id)
  }, [])

  const useTemplate = useCallback((id: string) => {
    return commentTemplateManager.useTemplate(id)
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    return commentTemplateManager.toggleFavorite(id)
  }, [])

  const searchTemplates = useCallback((query: string) => {
    return commentTemplateManager.searchTemplates(query)
  }, [])

  const getCategories = useCallback(() => {
    return commentTemplateManager.getCategories()
  }, [])

  const getTemplatesByCategory = useCallback((category: string) => {
    return commentTemplateManager.getTemplatesByCategory(category)
  }, [])

  const getFavorites = useCallback(() => {
    return commentTemplateManager.getFavoriteTemplates()
  }, [])

  return {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    toggleFavorite,
    searchTemplates,
    getCategories,
    getTemplatesByCategory,
    getFavorites,
  }
}
