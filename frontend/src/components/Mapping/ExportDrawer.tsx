import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { ReconciliationResult } from '../../types'
import { useTheme } from '../../hooks/useTheme'
import { EXPORT_FORMATS } from '../../lib/exportFormats'

interface Props {
  result: ReconciliationResult | null
  onClose: () => void
}

export default function ExportDrawer({ result, onClose }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!result) return null

  const handleDownload = (formatId: string) => {
    const format = EXPORT_FORMATS.find((f) => f.id === formatId)
    if (!format) return

    const content = format.generator(result)
    const blob = new Blob([content], { type: format.mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = format.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = (formatId: string) => {
    const format = EXPORT_FORMATS.find((f) => f.id === formatId)
    if (!format) return

    const content = format.generator(result)
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(formatId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <AnimatePresence>
      {result && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 z-40 backdrop-blur-sm ${
              isDark ? 'bg-black/40' : 'bg-black/20'
            }`}
          />

          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl overflow-y-auto border-l ${
              isDark
                ? 'bg-[#0a0a12] border-white/[0.07]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className={`sticky top-0 border-b backdrop-blur-sm px-6 py-4 flex items-center justify-between ${
              isDark
                ? 'border-white/[0.07] bg-[#06060e]/80'
                : 'border-slate-200 bg-slate-50/80'
            }`}>
              <div>
                <h2 className={`text-lg font-semibold ${
                  isDark ? 'text-white/80' : 'text-slate-900'
                }`}>Export Migration</h2>
                <p className={`mt-1 text-xs ${
                  isDark ? 'text-white/40' : 'text-slate-600'
                }`}>
                  Generate migration files for your tool
                </p>
              </div>
              <button
                onClick={onClose}
                className={`transition-colors p-1 ${
                  isDark
                    ? 'text-white/40 hover:text-white/60'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className={`rounded-lg border p-4 ${
                isDark
                  ? 'border-blue-500/20 bg-blue-500/[0.06]'
                  : 'border-blue-300 bg-blue-100'
              }`}>
                <p className={`text-xs ${
                  isDark ? 'text-blue-200' : 'text-blue-900'
                }`}>
                  <span className="font-medium">Info:</span> All exports include table/column mappings with confidence scores and TODO comments for conflicts and unmatched columns.
                </p>
              </div>

              <div className="space-y-4">
                {EXPORT_FORMATS.map((format) => (
                  <div
                    key={format.id}
                    className={`rounded-lg border p-4 ${
                      isDark
                        ? 'border-white/[0.07] bg-white/[0.03]'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className={`font-medium ${
                          isDark ? 'text-white/80' : 'text-slate-900'
                        }`}>
                          {format.name}
                        </h3>
                        <p className={`text-xs mt-1 ${
                          isDark ? 'text-white/40' : 'text-slate-600'
                        }`}>
                          {format.filename}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleDownload(format.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                          isDark
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </motion.button>

                      <motion.button
                        onClick={() => handleCopy(format.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                          copiedId === format.id
                            ? isDark
                              ? 'bg-blue-500/30 text-blue-300'
                              : 'bg-blue-100 text-blue-700'
                            : isDark
                              ? 'bg-white/[0.08] text-white/70 hover:bg-white/[0.12]'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {copiedId === format.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`rounded-lg border-l-4 p-4 ${
                isDark
                  ? 'border-l-amber-500 bg-amber-500/[0.06]'
                  : 'border-l-amber-500 bg-amber-100'
              }`}>
                <p className={`text-xs ${
                  isDark ? 'text-amber-200' : 'text-amber-900'
                }`}>
                  <span className="font-medium">Next steps:</span> Review the generated migration files carefully. All TODO comments indicate areas requiring manual review or implementation.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
