import { useState } from 'react'
import type { ReconciliationResult } from '../../types'

type Props = {
  result: ReconciliationResult
}

export default function MigrationScaffold({ result }: Props) {
  const [copied, setCopied] = useState(false)

  const migrationCode =
    typeof result.migration_scaffold === 'string'
      ? result.migration_scaffold
      : result.migration_scaffold
        ? JSON.stringify(result.migration_scaffold, null, 2)
        : '-- No migration scaffold generated yet.'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(migrationCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([migrationCode], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'migration-scaffold.sql'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Migration Scaffold
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Auto-generated SQL to migrate your schema
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-slate-200 text-slate-900 hover:bg-slate-300 transition-all active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <pre className="overflow-x-auto bg-slate-950 p-4 text-sm text-slate-100 font-mono">
          <code>{migrationCode}</code>
        </pre>
      </div>

      {/* Info Card */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 Tip:</span> Review this scaffold carefully before running in production. 
          Manual adjustments may be needed for data transformations or custom logic.
        </p>
      </div>
    </div>
  )
}
