import { useState } from 'react'
import type { ReconciliationResult } from './types'

import UploadPanel from './components/Upload/UploadPanel'
import EquivalenceGraph from './components/Graph/EquivalenceGraph'
import MappingTable from './components/Mapping/MappingTable'
import ConflictReport from './components/Conflicts/ConflictReport'
import MigrationScaffold from './components/CodeGen/MigrationScaffold'

type Tab = 'mappings' | 'graph' | 'conflicts' | 'migration'
const TABS: Tab[] = ['mappings', 'graph', 'conflicts', 'migration']

export default function App() {
  const [result, setResult] = useState<ReconciliationResult | undefined>()
  const [activeTab, setActiveTab] = useState<Tab>('mappings')

  const handleReset = () => {
    setResult(undefined)
    setActiveTab('mappings')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900">SchemaSync</h1>
          <p className="text-sm text-slate-600">Automated database schema reconciliation</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!result ? (
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-slate-900">Upload Schemas</h2>
            <UploadPanel onResult={setResult} />
          </div>
        ) : (
          <div className="grid gap-8">
            <div className="rounded-lg bg-white shadow-sm">
              {/* Tab bar */}
              <div className="flex border-b border-slate-200">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-6">
                {activeTab === 'mappings'  && <MappingTable result={result} />}
                {activeTab === 'graph'     && <EquivalenceGraph result={result} />}
                {activeTab === 'conflicts' && <ConflictReport result={result} />}
                {activeTab === 'migration' && <MigrationScaffold result={result} />}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-slate-200 px-6 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-300"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-600">
        <p>SchemaSync © 2026 | Turning weeks of schema mapping into seconds</p>
      </footer>
    </div>
  )
}
