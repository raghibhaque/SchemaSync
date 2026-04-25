import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  structuralScore: number
  semanticScore: number
  combinedScore: number
  matchReason?: string
  showOnHover?: boolean
}

export function ConfidenceTooltip({
  structuralScore,
  semanticScore,
  combinedScore,
  matchReason,
  showOnHover = false,
}: Props) {
  const [show, setShow] = useState(false)

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-lg border border-white/[0.12] bg-[#0a0a12]/95 backdrop-blur-sm p-4 shadow-2xl text-xs space-y-3 max-w-xs z-[9999]"
    >
      {/* Header */}
      <p className="font-semibold text-white/80">Confidence Breakdown</p>

      {/* Scores */}
      <div className="space-y-2 text-white/60">
        <ScoreLine
          label="Structural"
          score={structuralScore}
          color="indigo"
          help="Table structure similarity (columns, types, keys)"
        />
        <ScoreLine
          label="Semantic"
          score={semanticScore}
          color="violet"
          help="Name & meaning similarity (tokens, embeddings)"
        />
        <div className="pt-1 border-t border-white/[0.1]" />
        <ScoreLine
          label="Combined"
          score={combinedScore}
          color="emerald"
          weight="bold"
          help="Weighted average (35% structural, 65% semantic)"
        />
      </div>

      {/* Match reason */}
      {matchReason && (
        <div className="pt-2 border-t border-white/[0.1]">
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Reason</p>
          <p className="text-white/40 leading-relaxed">{matchReason}</p>
        </div>
      )}
    </motion.div>
  )

  if (showOnHover) {
    return (
      <div
        className="relative inline-block"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {/* Trigger */}
        <div className="cursor-help" />

        {/* Tooltip - positioned to avoid overlap */}
        <AnimatePresence>
          {show && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pointer-events-none z-[9999] whitespace-nowrap">
              {content}
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return content
}

function ScoreLine({
  label,
  score,
  color,
  weight = 'normal',
  help,
}: {
  label: string
  score: number
  color: 'indigo' | 'violet' | 'emerald'
  weight?: 'normal' | 'bold'
  help?: string
}) {
  const pct = (score * 100).toFixed(2)
  const colorClass =
    color === 'indigo' ? 'text-indigo-300' :
    color === 'violet' ? 'text-violet-300' :
    'text-emerald-300'

  return (
    <div title={help}>
      <div className="flex items-center justify-between mb-1">
        <span className={weight === 'bold' ? 'font-semibold text-white/70' : 'text-white/50'}>
          {label}
        </span>
        <span className={cn('font-mono', colorClass, weight === 'bold' && 'text-sm font-bold')}>
          {pct}%
        </span>
      </div>
      <ProgressBar pct={score * 100} color={color} />
    </div>
  )
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const bgColor =
    color === 'indigo' ? 'bg-indigo-400/30' :
    color === 'violet' ? 'bg-violet-400/30' :
    'bg-emerald-400/30'

  return (
    <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
      <motion.div
        className={bgColor}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}
