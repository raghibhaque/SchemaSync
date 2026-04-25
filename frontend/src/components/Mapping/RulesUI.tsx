import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { CustomRule, RuleType } from '../../hooks/useCustomRules'

interface Props {
  rules: CustomRule[]
  onAddRule: (rule: Omit<CustomRule, 'id'>) => void
  onUpdateRule: (id: string, updates: Partial<CustomRule>) => void
  onDeleteRule: (id: string) => void
}

const RULE_TYPES: { value: RuleType; label: string; description: string }[] = [
  { value: 'remove_prefix', label: 'Remove prefix', description: 'Remove text from start' },
  { value: 'remove_suffix', label: 'Remove suffix', description: 'Remove text from end' },
  { value: 'replace', label: 'Replace text', description: 'Find and replace text' },
  { value: 'synonym', label: 'Add synonym', description: 'Map column names' },
  { value: 'normalize_case', label: 'Normalize case', description: 'Convert to lower/upper' },
]

export default function RulesUI({
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'remove_prefix' as RuleType,
    name: '',
    prefix: '',
    suffix: '',
    find: '',
    replace: '',
    synonym: '',
    caseType: 'lower' as const,
  })

  const getPreviewResult = (sampleName: string) => {
    const type = formData.type
    switch (type) {
      case 'remove_prefix':
        return formData.prefix && sampleName.startsWith(formData.prefix)
          ? sampleName.slice(formData.prefix.length)
          : sampleName
      case 'remove_suffix':
        return formData.suffix && sampleName.endsWith(formData.suffix)
          ? sampleName.slice(0, -formData.suffix.length)
          : sampleName
      case 'replace':
        return formData.find ? sampleName.replace(new RegExp(formData.find, 'g'), formData.replace || '') : sampleName
      case 'synonym':
        return sampleName.toLowerCase() === (formData.synonym || '').toLowerCase()
          ? formData.replace || sampleName
          : sampleName
      case 'normalize_case':
        return (formData.caseType as string) === 'upper' ? sampleName.toUpperCase() : sampleName.toLowerCase()
      default:
        return sampleName
    }
  }

  const handleSave = () => {
    if (!formData.name.trim()) return

    const config: any = {}
    switch (formData.type) {
      case 'remove_prefix':
        config.prefix = formData.prefix
        break
      case 'remove_suffix':
        config.suffix = formData.suffix
        break
      case 'replace':
        config.find = formData.find
        config.replace = formData.replace
        break
      case 'synonym':
        config.synonym = formData.synonym
        config.replace = formData.replace
        break
      case 'normalize_case':
        config.caseType = formData.caseType
        break
    }

    onAddRule({
      type: formData.type,
      name: formData.name,
      enabled: true,
      config,
    })

    setFormData({
      type: 'remove_prefix',
      name: '',
      prefix: '',
      suffix: '',
      find: '',
      replace: '',
      synonym: '',
      caseType: 'lower',
    })
    setShowForm(false)
  }

  const sampleName = 'user_id_created'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${'text-white/80'}`}>
          Custom Rules ({rules.length})
        </h3>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            showForm
              ? 'bg-emerald-500/30 text-emerald-200'
              : 'bg-white/[0.08] text-white/70 hover:bg-white/[0.12]'
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Rule
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            'bg-white/[0.05] border-white/[0.1]'
          }`}
        >
          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${
                'text-white/60'
              }`}>
                Rule Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as RuleType })}
                className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  'bg-white/[0.08] border-white/[0.1] text-white/80'
                }`}
              >
                {RULE_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label} - {rt.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${
                'text-white/60'
              }`}>
                Rule Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Remove id prefix"
                className="w-full px-2.5 py-1.5 text-xs rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white/[0.08] border-white/[0.1] text-white/80 placeholder-white/30"
              />
            </div>

            {formData.type === 'remove_prefix' && (
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${
                  'text-white/60'
                }`}>
                  Prefix to remove
                </label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                  placeholder="e.g., tbl_"
                  className="w-full px-2.5 py-1.5 text-xs rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white/[0.08] border-white/[0.1] text-white/80 placeholder-white/30"
                />
              </div>
            )}

            {formData.type === 'remove_suffix' && (
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${
                  'text-white/60'
                }`}>
                  Suffix to remove
                </label>
                <input
                  type="text"
                  value={formData.suffix}
                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  placeholder="e.g., _id"
                  className="w-full px-2.5 py-1.5 text-xs rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white/[0.08] border-white/[0.1] text-white/80 placeholder-white/30"
                />
              </div>
            )}

            {formData.type === 'replace' && (
              <>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    'text-white/60'
                  }`}>
                    Find
                  </label>
                  <input
                    type="text"
                    value={formData.find}
                    onChange={(e) => setFormData({ ...formData, find: e.target.value })}
                    placeholder="e.g., _"
                    className="w-full px-2.5 py-1.5 text-xs rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white/[0.08] border-white/[0.1] text-white/80 placeholder-white/30"
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    'text-white/60'
                  }`}>
                    Replace with
                  </label>
                  <input
                    type="text"
                    value={formData.replace}
                    onChange={(e) => setFormData({ ...formData, replace: e.target.value })}
                    placeholder="e.g., (empty)"
                    className="w-full px-2.5 py-1.5 text-xs rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white/[0.08] border-white/[0.1] text-white/80 placeholder-white/30"
                  />
                </div>
              </>
            )}

            {formData.type === 'synonym' && (
              <>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    'text-white/60'
                  }`}>
                    Match column name
                  </label>
                  <input
                    type="text"
                    value={formData.synonym}
                    onChange={(e) => setFormData({ ...formData, synonym: e.target.value })}
                    placeholder="e.g., _id"
                    className="w-full px-2.5 py-1.5 text-xs rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white/[0.08] border-white/[0.1] text-white/80 placeholder-white/30"
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${
                    'text-white/60'
                  }`}>
                    Replace with
                  </label>
                  <input
                    type="text"
                    value={formData.replace}
                    onChange={(e) => setFormData({ ...formData, replace: e.target.value })}
                    placeholder="e.g., id"
                    className="w-full px-2.5 py-1.5 text-xs rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white/[0.08] border-white/[0.1] text-white/80 placeholder-white/30"
                  />
                </div>
              </>
            )}

            {formData.type === 'normalize_case' && (
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${
                  'text-white/60'
                }`}>
                  Case format
                </label>
                <select
                  value={formData.caseType}
                  onChange={(e) => setFormData({ ...formData, caseType: e.target.value as any })}
                  className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    'bg-white/[0.08] border-white/[0.1] text-white/80'
                  }`}
                >
                  <option value="lower">Lowercase</option>
                  <option value="upper">UPPERCASE</option>
                </select>
              </div>
            )}

            <div className="p-2.5 rounded-lg border border-blue-500/20 bg-blue-500/[0.06]">
              <div className="flex items-start gap-2">
                <Eye className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-blue-400" />
                <div className="text-xs">
                  <p className="text-blue-200">
                    Preview: <span className="font-mono">{sampleName}</span> →{' '}
                    <span className="font-mono">{getPreviewResult(sampleName)}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors bg-emerald-500/30 text-emerald-200 hover:bg-emerald-500/50"
              >
                Save Rule
              </motion.button>
              <motion.button
                onClick={() => setShowForm(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  'bg-white/[0.08] text-white/70 hover:bg-white/[0.12]'
                }`}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {rules.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {rules.map((rule) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center gap-3 p-2.5 rounded-lg border transition-colors bg-white/[0.05] border-white/[0.1] hover:bg-white/[0.08]"
              >
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(e) => onUpdateRule(rule.id, { enabled: e.target.checked })}
                  className="h-4 w-4 rounded accent-indigo-500"
                  aria-label={`Enable rule: ${rule.name}`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${
                    'text-white/80'
                  }`}>
                    {rule.name}
                  </p>
                  <p className="text-[11px] text-white/40">
                    {RULE_TYPES.find((rt) => rt.value === rule.type)?.label}
                  </p>
                </div>
                <motion.button
                  onClick={() => {
                    if (confirm(`Delete rule "${rule.name}"?`)) {
                      onDeleteRule(rule.id)
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="p-1 rounded transition-colors text-white/30 hover:text-red-400"
                  aria-label={`Delete rule: ${rule.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
