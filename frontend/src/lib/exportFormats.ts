import type { ReconciliationResult } from '../types'

export function generateGenericSQL(result: ReconciliationResult): string {
  const lines: string[] = [
    '-- SchemaSync Migration: Generic SQL',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Tables matched: ${result.summary.tables_matched}/${result.summary.tables_in_a}`,
    `-- Average confidence: ${(result.summary.average_confidence * 100).toFixed(1)}%`,
    '',
    '-- TABLE MAPPINGS',
    '-- =============',
  ]

  result.table_mappings.forEach((mapping) => {
    lines.push(`-- Source: ${mapping.table_a.name}`)
    lines.push(`-- Target: ${mapping.table_b.name}`)
    lines.push(`-- Confidence: ${(mapping.confidence * 100).toFixed(1)}%`)
    lines.push('')

    mapping.column_mappings?.forEach((col) => {
      const sourceType = col.col_a.data_type?.base_type || 'unknown'
      const targetType = col.col_b.data_type?.base_type || 'unknown'
      lines.push(
        `--   ${col.col_a.name} (${sourceType}) => ${col.col_b.name} (${targetType}) [${(col.confidence * 100).toFixed(0)}%]`
      )
    })
    lines.push('')
  })

  if (result.summary.total_conflicts > 0) {
    lines.push('-- ⚠️ CONFLICTS FOUND')
    lines.push(`-- Total conflicts: ${result.summary.total_conflicts}`)
    lines.push('-- TODO: Review and resolve conflicts before migration')
    lines.push('')
  }

  if (result.unmatched_tables_a.length > 0) {
    lines.push('-- ⚠️ UNMATCHED TABLES IN SOURCE')
    result.unmatched_tables_a.forEach((table) => {
      lines.push(`--   TODO: ${table}`)
    })
    lines.push('')
  }

  if (result.unmatched_tables_b.length > 0) {
    lines.push('-- ⚠️ UNMATCHED TABLES IN TARGET')
    result.unmatched_tables_b.forEach((table) => {
      lines.push(`--   TODO: ${table}`)
    })
    lines.push('')
  }

  lines.push('-- TODO: Implement actual migration DDL statements here')
  return lines.join('\n')
}

export function generateFlywaySQL(result: ReconciliationResult): string {
  const timestamp = new Date()
  const dateString = timestamp.toISOString().split('T')[0].replace(/-/g, '')
  const timeString = timestamp.toTimeString().split(' ')[0].replace(/:/g, '')
  const version = `${dateString}.${timeString}`

  const lines: string[] = [
    '-- Flyway Migration',
    `-- Version: V${version}`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Tables matched: ${result.summary.tables_matched}/${result.summary.tables_in_a}`,
    '',
    '-- Schema Mapping',
    '-- ==============',
  ]

  result.table_mappings.forEach((mapping) => {
    lines.push(`-- ${mapping.table_a.name} -> ${mapping.table_b.name} (${(mapping.confidence * 100).toFixed(0)}%)`)
  })

  lines.push('')
  lines.push('-- TODO: Implement migration statements based on mapping')
  lines.push('')
  lines.push('BEGIN TRANSACTION;')
  lines.push('')
  lines.push('-- Migration implementation goes here')
  lines.push('')
  lines.push('COMMIT;')

  return lines.join('\n')
}

export function generateLiquibaseXML(result: ReconciliationResult): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<databaseChangeLog',
    '  xmlns="http://www.liquibase.org/xml/ns/dbchangelog"',
    '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '  xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog',
    '  http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">',
    '',
    `  <!-- Generated: ${new Date().toISOString()} -->`,
    `  <!-- Tables matched: ${result.summary.tables_matched}/${result.summary.tables_in_a} -->`,
    `  <!-- Average confidence: ${(result.summary.average_confidence * 100).toFixed(1)}% -->`,
    '',
    '  <changeSet id="schemasync-migration" author="schemasync">',
    '    <comment>Schema mapping from SchemaSync</comment>',
    '',
    '    <!-- Table Mappings -->',
  ]

  result.table_mappings.forEach((mapping) => {
    lines.push(`    <!-- ${mapping.table_a.name} -> ${mapping.table_b.name} -->`)
    lines.push(`    <!-- Confidence: ${(mapping.confidence * 100).toFixed(1)}% -->`)
  })

  lines.push('')
  lines.push('    <!-- TODO: Add actual migration changes here -->',
    '  </changeSet>',
    '</databaseChangeLog>'
  )

  return lines.join('\n')
}

export function generateDMSJSON(result: ReconciliationResult): string {
  const mapping = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    summary: result.summary,
    table_mappings: result.table_mappings.map((tm) => ({
      source_table: tm.table_a.name,
      target_table: tm.table_b.name,
      confidence: tm.confidence,
      column_mappings: tm.column_mappings?.map((cm) => ({
        source_column: cm.col_a.name,
        source_type: cm.col_a.data_type?.base_type,
        target_column: cm.col_b.name,
        target_type: cm.col_b.data_type?.base_type,
        confidence: cm.confidence,
      })) || [],
      unmatched_source_columns: tm.unmatched_columns_a?.map((c) => ({
        name: c.name,
        type: c.data_type?.base_type,
      })) || [],
      unmatched_target_columns: tm.unmatched_columns_b?.map((c) => ({
        name: c.name,
        type: c.data_type?.base_type,
      })) || [],
    })),
    conflicts: result.summary.total_conflicts > 0 ? {
      total: result.summary.total_conflicts,
      critical: result.summary.critical_conflicts,
      note: 'TODO: Review and resolve conflicts',
    } : undefined,
  }

  return JSON.stringify(mapping, null, 2)
}

export interface ExportFormat {
  id: string
  name: string
  filename: string
  mimeType: string
  generator: (result: ReconciliationResult) => string
}

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'generic-sql',
    name: 'Generic SQL',
    filename: 'schemasync-migration.sql',
    mimeType: 'text/plain',
    generator: generateGenericSQL,
  },
  {
    id: 'flyway-sql',
    name: 'Flyway Migration',
    filename: 'schemasync-flyway-V1__schema_mapping.sql',
    mimeType: 'text/plain',
    generator: generateFlywaySQL,
  },
  {
    id: 'liquibase-xml',
    name: 'Liquibase XML',
    filename: 'schemasync-liquibase.xml',
    mimeType: 'application/xml',
    generator: generateLiquibaseXML,
  },
  {
    id: 'dms-json',
    name: 'AWS DMS JSON',
    filename: 'schemasync-dms-mapping.json',
    mimeType: 'application/json',
    generator: generateDMSJSON,
  },
]
