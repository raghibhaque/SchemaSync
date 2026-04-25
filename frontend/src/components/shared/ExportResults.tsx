import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, Copy, Check } from 'lucide-react'
import type { ReconciliationResult } from '../../types'
import { showToast } from '../../lib/toast'
import { cn } from '@/lib/utils'

interface Props {
  result: ReconciliationResult
}

type Format = 'json' | 'csv'

export default function ExportResults({ result }: Props) {
  const [selectedFormat, setSelectedFormat] = useState<Format>('json')
  const [copied, setCopied] = useState(false)

  const exportData = useMemo(() => {
    if (selectedFormat === 'json') {
      const data = {
        timestamp: new Date().toISOString(),
        summary: result.summary,
        table_mappings: result.table_mappings.map(m => ({
          source: m.table_a.name,
          target: m.table_b.name,
          confidence: m.confidence,
          structural_score: m.structural_score,
          semantic_score: m.semantic_score,
          columns_matched: m.column_mappings.length,
          column_details: m.column_mappings.map(col => ({
            source_column: col.col_a.name,
            target_column: col.col_b.name,
            source_type: col.col_a.data_type.base_type,
            target_type: col.col_b.data_type.base_type,
            confidence: col.confidence,
            conflicts_count: col.conflicts.length,
          })),
        })),
        unmatched_tables: result.unmatched_tables_a,
      }
      return JSON.stringify(data, null, 2)
    }

    // CSV format
    const lines = [
      'Table Mapping Report',
      `Generated: ${new Date().toISOString()}`,
      '',
      'Summary',
      `Total Tables Analyzed,${result.summary.tables_in_a + result.summary.tables_in_b}`,
      `Tables Matched,${result.summary.tables_matched}`,
      `Unmatched Tables,${result.unmatched_tables_a.length}`,
      `Average Confidence,${(result.summary.average_confidence * 100).toFixed(2)}%`,
      `Total Conflicts,${result.summary.total_conflicts}`,
      '',
      'Table Mappings',
      'Source Table,Target Table,Confidence,Structural Score,Semantic Score,Columns,Conflicts',
      ...result.table_mappings.map(m =>
        `${m.table_a.name},${m.table_b.name},${(m.confidence * 100).toFixed(1)}%,${(m.structural_score * 100).toFixed(1)}%,${(m.semantic_score * 100).toFixed(1)}%,${m.column_mappings.length},${m.column_mappings.reduce((sum, col) => sum + col.conflicts.length, 0)}`
      ),
      '',
      'Column Mappings',
      'Source Table,Source Column,Source Type,Target Table,Target Column,Target Type,Confidence',
      ...result.table_mappings.flatMap(m =>
        m.column_mappings.map(col =>
          `${m.table_a.name},${col.col_a.name},${col.col_a.data_type.base_type},${m.table_b.name},${col.col_b.name},${col.col_b.data_type.base_type},${(col.confidence * 100).toFixed(1)}%`
        )
      ),
      ...(result.unmatched_tables_a.length > 0 ? [
        '',
        'Unmatched Tables',
        'Table Name',
        ...result.unmatched_tables_a,
      ] : []),
    ]
    return lines.join('\n')
  }, [selectedFormat, result])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData)
      setCopied(true)
      showToast(`${selectedFormat.toUpperCase()} copied to clipboard`, 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Failed to copy', 'error')
    }
  }

  const handleDownload = () => {
    try {
      const a = document.createElement('a')
      const ext = selectedFormat === 'json' ? 'json' : 'csv'
      const mimeType = selectedFormat === 'json' ? 'application/json' : 'text/csv'
      a.href = URL.createObjectURL(new Blob([exportData], { type: mimeType }))
      a.download = `reconciliation-results.${ext}`
      a.click()
      showToast(`reconciliation-results.${ext} downloaded`, 'success')
    } catch {
      showToast('Failed to download file', 'error')
    }
  }

  const formatSize = (new Blob([exportData]).size / 1024).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-white/[0.1] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest flex items-center gap-2">
            <Download className="h-4 w-4 text-indigo-400" />
            Export Results
          </h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-semibold text-white/50 bg-white/[0.06] px-3 py-1 rounded-full"
          >
            {formatSize} KB
          </motion.div>
        </div>

        {/* Format selector */}
        <div className="flex gap-2 mb-5">
          {(['json', 'csv'] as const).map((fmt, idx) => (
            <motion.button
              key={fmt}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedFormat(fmt)}
              className={cn(
                'flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all border',
                selectedFormat === fmt
                  ? 'border-indigo-500/40 bg-gradient-to-br from-indigo-500/15 to-indigo-600/5 text-indigo-300 shadow-[0_8px_16px_rgba(99,102,241,0.2)]'
                  : 'border-white/[0.08] bg-white/[0.04] text-white/60 hover:border-white/[0.15] hover:bg-white/[0.08]'
              )}
            >
              .{fmt.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-white/[0.08] bg-gradient-to-br from-black/40 to-white/[0.02] p-4 max-h-48 overflow-hidden mb-5 font-mono text-[9px] leading-relaxed"
        >
          <pre className="text-white/50 overflow-auto custom-scrollbar">
            {exportData.slice(0, 400)}...
          </pre>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] px-4 py-2.5 text-sm font-semibold text-white/70 hover:border-white/[0.18] hover:bg-gradient-to-br hover:from-white/[0.12] hover:to-white/[0.04] hover:text-white/90 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          >
            <motion.span
              key={copied ? 'check' : 'copy'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center"
            >
              {copied ? (
                <><Check className="h-4 w-4 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
              ) : (
                <><Copy className="h-4 w-4" /><span>Copy</span></>
              )}
            </motion.span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 to-indigo-600/5 px-4 py-2.5 text-sm font-semibold text-indigo-300 hover:border-indigo-500/50 hover:bg-gradient-to-br hover:from-indigo-500/25 hover:to-indigo-600/10 transition-all shadow-[0_8px_16px_rgba(99,102,241,0.2)]"
          >
            <Download className="h-4 w-4" />
            Download
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
