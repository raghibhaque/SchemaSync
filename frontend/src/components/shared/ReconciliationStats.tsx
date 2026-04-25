import { motion } from 'framer-motion'
import { Clock, HardDrive, BarChart3 } from 'lucide-react'
import type { ReconciliationResult } from '../../types'
import { cn } from '@/lib/utils'

interface Props {
  result: ReconciliationResult
}

export default function ReconciliationStats({ result }: Props) {
  const { summary, table_mappings, unmatched_tables_a } = result

  // Calculate stats
  const totalTables = summary.tables_in_a + summary.tables_in_b
  const totalColumns = table_mappings.reduce((sum, m) => sum + m.column_mappings.length, 0)
  const matchedPercent = ((summary.tables_matched / summary.tables_in_a) * 100).toFixed(1)

  const stats = [
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: 'Tables analyzed',
      value: totalTables,
      detail: `${summary.tables_matched} matched, ${unmatched_tables_a.length} unmatched`,
    },
    {
      icon: <HardDrive className="h-4 w-4" />,
      label: 'Columns mapped',
      value: totalColumns,
      detail: `Across ${table_mappings.length} table mappings`,
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: 'Conflicts found',
      value: summary.total_conflicts,
      detail: summary.total_conflicts > 0 ? 'Review before migration' : 'All clear!',
    },
  ]

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white/70">Reconciliation Stats</h3>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3"
          >
            <div className="mb-2 text-white/40">{stat.icon}</div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
              {stat.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold text-white/80">{stat.value}</p>
            <p className="mt-1 text-[10px] text-white/30">{stat.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress indicators */}
      <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
        {[
          { label: 'Table match rate', value: parseFloat(matchedPercent), color: 'emerald' },
          { label: 'Overall confidence', value: summary.average_confidence * 100, color: 'indigo' },
        ].map((indicator, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="text-white/50">{indicator.label}</span>
              <span className={cn(
                'font-semibold',
                indicator.color === 'emerald' ? 'text-emerald-300' : 'text-indigo-300'
              )}>
                {indicator.value.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className={cn(
                  'h-full',
                  indicator.color === 'emerald' ? 'bg-emerald-400' : 'bg-indigo-400'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${indicator.value}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 + i * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
