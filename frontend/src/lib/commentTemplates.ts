/**
 * Comment template system for quick replies
 */

export interface CommentTemplate {
  id: string
  name: string
  content: string
  category: string
  createdAt: number
  usageCount: number
  isFavorite: boolean
}

class CommentTemplateManager {
  private templates: Map<string, CommentTemplate> = new Map()
  private nextId = 0
  private subscribers: Set<(templates: CommentTemplate[]) => void> = new Set()

  private readonly defaultTemplates: Omit<CommentTemplate, 'id' | 'createdAt' | 'usageCount'>[] = [
    {
      name: 'Needs Clarification',
      content: 'Could you provide more details about this change? Specifically, we need to understand the impact on existing functionality.',
      category: 'Questions',
      isFavorite: false
    },
    {
      name: 'Approved',
      content: 'Looks good to me! This change aligns well with our current design.',
      category: 'Approval',
      isFavorite: false
    },
    {
      name: 'Needs Revision',
      content: 'This needs some revision before we can proceed. Here are the main concerns:\n- [Issue 1]\n- [Issue 2]',
      category: 'Feedback',
      isFavorite: false
    },
    {
      name: 'Data Loss Risk',
      content: 'Warning: This change involves data conversion that could result in data loss. Please ensure proper backups and testing.',
      category: 'Warnings',
      isFavorite: false
    },
    {
      name: 'Conflict Detected',
      content: 'This mapping conflicts with an existing schema rule. We need to resolve this before proceeding.',
      category: 'Issues',
      isFavorite: false
    },
    {
      name: 'Documentation Needed',
      content: 'Could you add documentation explaining why this change is necessary? Include examples of how it affects the data flow.',
      category: 'Requests',
      isFavorite: false
    },
  ]

  constructor() {
    this.initializeDefaultTemplates()
  }

  private initializeDefaultTemplates(): void {
    this.defaultTemplates.forEach((template, idx) => {
      const id = `template-${idx}`
      this.templates.set(id, {
        id,
        ...template,
        createdAt: Date.now(),
        usageCount: 0
      })
    })
  }

  createTemplate(name: string, content: string, category: string): CommentTemplate {
    const id = `template-${++this.nextId}`
    const template: CommentTemplate = {
      id,
      name,
      content,
      category,
      createdAt: Date.now(),
      usageCount: 0,
      isFavorite: false
    }

    this.templates.set(id, template)
    this.notifySubscribers()
    return template
  }

  updateTemplate(id: string, updates: Partial<CommentTemplate>): CommentTemplate | null {
    const template = this.templates.get(id)
    if (!template) return null

    Object.assign(template, updates)
    this.notifySubscribers()
    return template
  }

  deleteTemplate(id: string): boolean {
    const success = this.templates.delete(id)
    if (success) {
      this.notifySubscribers()
    }
    return success
  }

  getTemplate(id: string): CommentTemplate | null {
    return this.templates.get(id) || null
  }

  getAllTemplates(): CommentTemplate[] {
    return Array.from(this.templates.values()).sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return b.isFavorite ? 1 : -1
      }
      return b.usageCount - a.usageCount
    })
  }

  getTemplatesByCategory(category: string): CommentTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.category === category)
      .sort((a, b) => b.usageCount - a.usageCount)
  }

  getCategories(): string[] {
    const categories = new Set<string>()
    this.templates.forEach(t => categories.add(t.category))
    return Array.from(categories).sort()
  }

  useTemplate(id: string): CommentTemplate | null {
    const template = this.templates.get(id)
    if (template) {
      template.usageCount++
      this.notifySubscribers()
    }
    return template || null
  }

  toggleFavorite(id: string): CommentTemplate | null {
    const template = this.templates.get(id)
    if (template) {
      template.isFavorite = !template.isFavorite
      this.notifySubscribers()
    }
    return template || null
  }

  getFavoriteTemplates(): CommentTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.isFavorite)
      .sort((a, b) => b.usageCount - a.usageCount)
  }

  searchTemplates(query: string): CommentTemplate[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.templates.values())
      .filter(t => t.name.toLowerCase().includes(lowerQuery) ||
                   t.content.toLowerCase().includes(lowerQuery) ||
                   t.category.toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        const aMatch = a.name.toLowerCase().startsWith(lowerQuery) ? 1 : 0
        const bMatch = b.name.toLowerCase().startsWith(lowerQuery) ? 1 : 0
        return (bMatch - aMatch) || (b.usageCount - a.usageCount)
      })
  }

  subscribe(callback: (templates: CommentTemplate[]) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notifySubscribers(): void {
    const all = this.getAllTemplates()
    this.subscribers.forEach(cb => cb(all))
  }
}

export const commentTemplateManager = new CommentTemplateManager()
