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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-white/[0.1] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 rounded-full opacity-10 blur-3xl bg-gradient-to-br from-indigo-500 to-violet-500" />

      <div className="relative z-10">
        <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            ⚙️
          </motion.span>
          Reconciliation Stats
        </h3>

        {/* Stats grid */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="rounded-lg border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-3.5 backdrop-blur-sm hover:border-white/[0.15] transition-all"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08 + 0.05 }}
                className="mb-2.5 text-white/50"
              >
                {stat.icon}
              </motion.div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                {stat.label}
              </p>
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08 + 0.1 }}
                className="mt-2 text-2xl font-bold text-white/90"
              >
                {stat.value}
              </motion.p>
              <p className="mt-1.5 text-[10px] text-white/50 font-medium">{stat.detail}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress indicators */}
        <div className="space-y-3 mt-6 pt-6 border-t border-white/[0.08]">
          {[
            { label: 'Table match rate', value: parseFloat(matchedPercent), color: 'emerald' },
            { label: 'Overall confidence', value: summary.average_confidence * 100, color: 'indigo' },
          ].map((indicator, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-white/60 font-medium">{indicator.label}</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className={cn(
                    'font-bold',
                    indicator.color === 'emerald' ? 'text-emerald-300' : 'text-indigo-300'
                  )}
                >
                  {indicator.value.toFixed(1)}%
                </motion.span>
              </div>
              <div className="h-2 rounded-full bg-gradient-to-r from-white/[0.08] to-white/[0.04] overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    indicator.color === 'emerald'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  )}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${indicator.value}%`, opacity: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 + i * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
