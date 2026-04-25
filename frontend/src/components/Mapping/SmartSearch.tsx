import { motion } from 'framer-motion'
import { Search, Lightbulb } from 'lucide-react'
import { useState, useMemo } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  onSmartFilterApply: (intent: string) => void
  placeholder?: string
}

export default function SmartSearch({ value, onChange, onSmartFilterApply, placeholder = 'Search tables or use smart filters...' }: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const smartFilterSuggestions = useMemo(() => {
    const intents: Array<{ text: string; intent: string; description: string; emoji: string }> = [
      { text: 'broken types', intent: 'type-mismatch', description: 'Find type mismatches', emoji: '🔧' },
      { text: 'needs fix', intent: 'needs-review', description: 'Unreviewed with conflicts', emoji: '⚠️' },
      { text: 'quick wins', intent: 'high-confidence-unreviewed', description: 'High confidence, unreviewed', emoji: '✨' },
      { text: 'risky', intent: 'low-confidence', description: 'Low confidence mappings', emoji: '🚨' },
      { text: 'conflicts only', intent: 'conflicts', description: 'Show conflicts', emoji: '⚡' },
      { text: 'reviewed', intent: 'reviewed', description: 'Already reviewed', emoji: '✓' },
    ]

    if (!value.trim()) return intents

    return intents.filter(s => s.text.includes(value.toLowerCase()) || s.description.toLowerCase().includes(value.toLowerCase()))
  }, [value])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2.5 pl-10 pr-12 text-sm text-white/80 placeholder-white/25 transition-colors focus:border-indigo-500/30 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
        />
        <Lightbulb className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400/50" />
      </div>

      {/* Smart Filter Suggestions */}
      {showSuggestions && smartFilterSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          onMouseLeave={() => setShowSuggestions(false)}
          className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-indigo-500/5 shadow-lg z-10 overflow-hidden"
        >
          <div className="p-2 space-y-1">
            <p className="text-xs font-semibold text-indigo-300/60 px-2 py-1 uppercase tracking-wider">Smart Filters</p>
            {smartFilterSuggestions.map((suggestion) => (
              <motion.button
                key={suggestion.intent}
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                onClick={() => {
                  onSmartFilterApply(suggestion.intent)
                  setShowSuggestions(false)
                  onChange('')
                }}
                className="w-full text-left px-2 py-2 rounded text-xs transition-colors hover:bg-indigo-500/10"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{suggestion.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white/80">{suggestion.text}</p>
                    <p className="text-white/40 text-[10px]">{suggestion.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
