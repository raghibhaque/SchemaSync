import { useRef, useState } from 'react'
import type { ReconciliationResult } from '../../types'
import { apiClient } from '../../lib/api'

type Props = {
  onResult: (result: ReconciliationResult) => void
}

export default function UploadPanel({ onResult }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [targetFile, setTargetFile] = useState<File | null>(null)

  const sourceRef = useRef<HTMLInputElement>(null)
  const targetRef = useRef<HTMLInputElement>(null)

  const run = async (fn: () => Promise<ReconciliationResult>) => {
    setIsLoading(true)
    setError(null)
    try {
      onResult(await fn())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunDemo = () => run(() => apiClient.runDemo())

  const handleReconcile = () => {
    if (!sourceFile || !targetFile) return
    run(async () => {
      const [srcName, tgtName] = await Promise.all([
        apiClient.uploadFile(sourceFile),
        apiClient.uploadFile(targetFile),
      ])
      return apiClient.reconcileFiles(srcName, tgtName)
    })
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-xs text-red-600 underline hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Demo section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick Demo
        </h3>
        <p className="text-sm text-slate-600">
          Try a pre-loaded Ghost vs WordPress schema reconciliation — no files needed.
        </p>
        <button
          onClick={handleRunDemo}
          disabled={isLoading}
          className={`w-full rounded-lg px-6 py-3 font-medium text-white transition-all ${
            isLoading
              ? 'cursor-not-allowed bg-blue-400'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8" />
              </svg>
              Running reconciliation…
            </span>
          ) : (
            'Run Demo (Ghost vs WordPress)'
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">or upload your own</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* File upload section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Custom Schemas
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Source schema */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Source Schema (.sql)
            </label>
            <input
              ref={sourceRef}
              type="file"
              accept=".sql"
              className="hidden"
              onChange={e => setSourceFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => sourceRef.current?.click()}
              disabled={isLoading}
              className={`flex w-full items-center gap-3 rounded-lg border-2 border-dashed px-4 py-4 text-left transition-colors ${
                sourceFile
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <svg
                className={`h-6 w-6 shrink-0 ${sourceFile ? 'text-blue-500' : 'text-slate-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className={`text-sm truncate ${sourceFile ? 'text-blue-700 font-medium' : 'text-slate-500'}`}>
                {sourceFile ? sourceFile.name : 'Choose source .sql file…'}
              </span>
            </button>
          </div>

          {/* Target schema */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Target Schema (.sql)
            </label>
            <input
              ref={targetRef}
              type="file"
              accept=".sql"
              className="hidden"
              onChange={e => setTargetFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => targetRef.current?.click()}
              disabled={isLoading}
              className={`flex w-full items-center gap-3 rounded-lg border-2 border-dashed px-4 py-4 text-left transition-colors ${
                targetFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <svg
                className={`h-6 w-6 shrink-0 ${targetFile ? 'text-green-500' : 'text-slate-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className={`text-sm truncate ${targetFile ? 'text-green-700 font-medium' : 'text-slate-500'}`}>
                {targetFile ? targetFile.name : 'Choose target .sql file…'}
              </span>
            </button>
          </div>
        </div>

        <button
          onClick={handleReconcile}
          disabled={!sourceFile || !targetFile || isLoading}
          className={`w-full rounded-lg px-6 py-3 font-medium transition-all ${
            !sourceFile || !targetFile || isLoading
              ? 'cursor-not-allowed bg-slate-200 text-slate-400'
              : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'
          }`}
        >
          {isLoading ? 'Reconciling…' : 'Reconcile Schemas'}
        </button>
      </div>
    </div>
  )
}
