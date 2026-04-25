import { useState } from 'react'
import { Database, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import {
  introspectDatabase,
  testDatabaseConnection,
  getDatabaseTypeName,
  getExampleConnection,
  validateConnection,
  type DatabaseType,
  type DatabaseConnectionRequest,
  type DatabaseIntrospectionResult,
} from '../../lib/databaseConnectors'
import type { Table } from '../../types'

interface Props {
  onSchemaParsed: (tables: Table[]) => void
}

export default function DatabaseConnector({ onSchemaParsed }: Props) {
  const [dbType, setDbType] = useState<DatabaseType>('postgresql')
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState('5432')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [database, setDatabase] = useState('')
  const [sslEnabled, setSslEnabled] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [introspectionResult, setIntrospectionResult] = useState<DatabaseIntrospectionResult | null>(null)

  const handleConnect = async () => {
    // Validate inputs
    const validation = validateConnection({
      type: dbType,
      host,
      port: parseInt(port),
      username,
      database: database || undefined,
    })

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    if (!password) {
      setErrors(['Password is required'])
      return
    }

    setIsLoading(true)
    setErrors([])

    try {
      const connection: DatabaseConnectionRequest = {
        type: dbType,
        host,
        port: parseInt(port),
        username,
        password,
        database: database || undefined,
        sslEnabled,
      }

      const result = await introspectDatabase(connection)
      setIntrospectionResult(result)
      onSchemaParsed(result.tables)
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Unknown error occurred'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    const validation = validateConnection({
      type: dbType,
      host,
      port: parseInt(port),
      username,
      database: database || undefined,
    })

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    if (!password) {
      setErrors(['Password is required'])
      return
    }

    setIsLoading(true)
    setErrors([])

    try {
      const connection: DatabaseConnectionRequest = {
        type: dbType,
        host,
        port: parseInt(port),
        username,
        password,
        database: database || undefined,
        sslEnabled,
      }

      const success = await testDatabaseConnection(connection)
      if (success) {
        setErrors([]) // Clear errors on success
      } else {
        setErrors(['Connection test failed'])
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Unknown error occurred'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadExample = () => {
    const example = getExampleConnection(dbType)
    setHost(example.host)
    setPort(example.port.toString())
    setUsername(example.username)
    setDatabase(example.database || '')
    setSslEnabled(example.sslEnabled)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Database size={18} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white/80">Live Database Connection</h3>
      </div>

      <div className="space-y-3">
        {/* Database Type Selection */}
        <div>
          <label className="text-xs text-white/60 block mb-1">Database Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['postgresql', 'mysql', 'mongodb'] as const).map(type => (
              <button
                key={type}
                onClick={() => {
                  setDbType(type)
                  setErrors([])
                }}
                className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                  dbType === type
                    ? 'bg-blue-500/30 text-blue-300'
                    : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08]'
                }`}
              >
                {getDatabaseTypeName(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Connection Parameters */}
        <div className="space-y-2">
          <div>
            <label className="text-xs text-white/60 block mb-1">Host</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="localhost"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 block mb-1">Port</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="5432"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="user"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/60 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Database (optional)</label>
              <input
                type="text"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                placeholder="myapp"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-white/60">
            <input
              type="checkbox"
              checked={sslEnabled}
              onChange={(e) => setSslEnabled(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Use SSL/TLS
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleTestConnection}
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded text-xs font-medium bg-white/[0.05] text-white/60 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
          >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : null}
            Test Connection
          </button>
          <button
            onClick={handleConnect}
            disabled={isLoading || !password}
            className="flex-1 px-3 py-2 rounded text-xs font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
          >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : null}
            Load Schema
          </button>
          <button
            onClick={handleLoadExample}
            className="px-3 py-2 rounded text-xs font-medium bg-white/[0.05] text-white/60 hover:bg-white/[0.08] transition-colors"
          >
            Example
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded p-3 space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
            <p className="text-xs font-medium text-rose-300">Error:</p>
          </div>
          <ul className="space-y-0.5">
            {errors.map((error, idx) => (
              <li key={idx} className="text-xs text-rose-200/70">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success */}
      {introspectionResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <p className="text-xs font-medium text-emerald-300">
              Connected to {introspectionResult.metadata.database}
            </p>
          </div>
          <div className="text-xs text-emerald-200/70 space-y-1">
            <p>Found {introspectionResult.metadata.tableCount} tables</p>
            <p>Total {introspectionResult.metadata.totalColumns} columns</p>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {introspectionResult.tables.slice(0, 5).map(table => (
              <div key={table.name} className="text-xs text-emerald-200/60 px-2 py-0.5 rounded bg-emerald-500/5">
                <span className="font-mono text-emerald-300">{table.name}</span>
                <span className="text-white/40"> ({table.columns.length})</span>
              </div>
            ))}
            {introspectionResult.tables.length > 5 && (
              <div className="text-xs text-white/40 px-2 py-0.5">
                ... and {introspectionResult.tables.length - 5} more tables
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
