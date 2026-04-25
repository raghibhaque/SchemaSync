import type { ReconciliationResult } from '../../types'

type Props = {
  result: ReconciliationResult
}

export default function MigrationScaffold({ result }: Props) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Migration Scaffold
      </h2>

      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
        <code>
          {typeof result.migration_scaffold === 'string'
            ? result.migration_scaffold
            : result.migration_scaffold
              ? JSON.stringify(result.migration_scaffold, null, 2)
              : '-- No migration scaffold generated yet.'}
        </code>
      </pre>
    </div>
  )
}