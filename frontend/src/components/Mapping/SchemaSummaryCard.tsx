import { motion } from 'framer-motion'
import { Database, Columns, AlertCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReconciliationResult } from '../../types'

interface Props {
  result: ReconciliationResult
}

export default function SchemaSummaryCard({ result }: Props) {
  if (!result.table_mappings || result.table_mappings.length === 0) {
    return null
  }

  // Calculate overall statistics
  const totalSourceColumns = result.table_mappings.reduce((sum, m) => sum + m.table_a.columns.length, 0)
  const totalTargetColumns = result.table_mappings.reduce((sum, m) => sum + m.table_b.columns.length, 0)
  const totalMappedColumns = result.table_mappings.reduce((sum, m) => sum + (m.column_mappings?.length || 0), 0)
  const totalTypeConflicts = result.table_mappings.reduce((sum, m) => {
    const conflicts = (m.column_mappings || []).filter((cm: any) => {
      const sourceType = (cm.col_a?.type || '').toLowerCase()
      const targetType = (cm.col_b?.type || '').toLowerCase()
      return sourceType !== targetType && sourceType !== '' && targetType !== ''
    }).length
    return sum + conflicts
  }, 0)

  const totalIndexes = 0 // result.table_mappings.reduce((sum, m) => sum + (m.table_a.indexes?.length || 0), 0)
  const totalPrimaryKeys = 0 // result.table_mappings.filter(m => m.table_a.primary_key).length

  const averageColumnDifference = Math.round((Math.abs(totalSourceColumns - totalTargetColumns) / result.table_mappings.length) * 10) / 10

  const stats = [
    {
      icon: Database,
      label: 'Tables',
      value: result.table_mappings.length,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      icon: Columns,
      label: 'Total Columns',
      value: `${totalSourceColumns} → ${totalTargetColumns}`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Mapped',
      value: totalMappedColumns,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    },
    ...(totalTypeConflicts > 0 ? [{
      icon: AlertCircle,
      label: 'Type Conflicts',
      value: totalTypeConflicts,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
    }] : []),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-white/60" />
        <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide">Schema Overview</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'rounded-lg border p-3 space-y-2',
              stat.bgColor
            )}
          >
            <div className="flex items-center gap-2">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">{stat.label}</p>
            </div>
            <p className={cn('text-lg font-bold', stat.color)}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
        {totalPrimaryKeys > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs bg-white/[0.03] border border-white/[0.08] rounded p-2"
          >
            <p className="text-white/50">Primary Keys</p>
            <p className="font-semibold text-emerald-300">{totalPrimaryKeys}</p>
          </motion.div>
        )}

        {totalIndexes > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-xs bg-white/[0.03] border border-white/[0.08] rounded p-2"
          >
            <p className="text-white/50">Indexes</p>
            <p className="font-semibold text-cyan-300">{totalIndexes}</p>
          </motion.div>
        )}

        {averageColumnDifference > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs bg-white/[0.03] border border-white/[0.08] rounded p-2"
          >
            <p className="text-white/50">Avg Diff</p>
            <p className="font-semibold text-amber-300">{averageColumnDifference}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
