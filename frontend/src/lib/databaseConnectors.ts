/**
 * Database Connector Utilities
 * Frontend interface for connecting to live databases and introspecting schemas.
 */

import type { Table } from '../types'

export type DatabaseType = 'mysql' | 'postgresql' | 'mongodb'

export interface DatabaseConnection {
  type: DatabaseType
  host: string
  port: number
  username: string
  database?: string
  sslEnabled: boolean
}

export interface DatabaseConnectionRequest extends DatabaseConnection {
  password: string
}

export interface DatabaseIntrospectionResult {
  tables: Table[]
  metadata: {
    timestamp: number
    database: string
    tableCount: number
    totalColumns: number
  }
}

/**
 * Default ports for common databases
 */
const DEFAULT_PORTS: Record<DatabaseType, number> = {
  mysql: 3306,
  postgresql: 5432,
  mongodb: 27017,
}

/**
 * Create a database connection object with defaults
 */
export function createDatabaseConnection(
  type: DatabaseType,
  host: string,
  username: string,
  options?: Partial<DatabaseConnection>
): DatabaseConnection {
  return {
    type,
    host,
    port: options?.port || DEFAULT_PORTS[type],
    username,
    database: options?.database,
    sslEnabled: options?.sslEnabled ?? true,
  }
}

/**
 * Introspect a live database connection to get schema
 * This calls a backend API endpoint
 */
export async function introspectDatabase(
  connection: DatabaseConnectionRequest
): Promise<DatabaseIntrospectionResult> {
  try {
    const response = await fetch('/api/introspect/database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: connection.type,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        database: connection.database,
        ssl: connection.sslEnabled,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || `Database introspection failed: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      tables: data.tables || [],
      metadata: {
        timestamp: Date.now(),
        database: connection.database || 'default',
        tableCount: data.tables?.length || 0,
        totalColumns: (data.tables || []).reduce((sum: number, t: Table) => sum + t.columns.length, 0),
      },
    }
  } catch (err) {
    throw new Error(`Failed to introspect database: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

/**
 * Test a database connection without introspecting
 */
export async function testDatabaseConnection(connection: DatabaseConnectionRequest): Promise<boolean> {
  try {
    const response = await fetch('/api/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: connection.type,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        database: connection.database,
        ssl: connection.sslEnabled,
      }),
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * Get human-readable database type name
 */
export function getDatabaseTypeName(type: DatabaseType): string {
  const names: Record<DatabaseType, string> = {
    mysql: 'MySQL',
    postgresql: 'PostgreSQL',
    mongodb: 'MongoDB',
  }
  return names[type]
}

/**
 * Get example connection parameters for a database type
 */
export function getExampleConnection(type: DatabaseType): DatabaseConnection {
  const examples: Record<DatabaseType, DatabaseConnection> = {
    mysql: {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      database: 'myapp',
      sslEnabled: false,
    },
    postgresql: {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      database: 'myapp',
      sslEnabled: false,
    },
    mongodb: {
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      username: 'admin',
      database: 'myapp',
      sslEnabled: false,
    },
  }
  return examples[type]
}

/**
 * Validate connection parameters
 */
export function validateConnection(connection: Partial<DatabaseConnection>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!connection.type) errors.push('Database type is required')
  if (!connection.host) errors.push('Host is required')
  if (!connection.port) errors.push('Port is required')
  if (!connection.username) errors.push('Username is required')

  if (connection.port && (connection.port < 1 || connection.port > 65535)) {
    errors.push('Port must be between 1 and 65535')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
