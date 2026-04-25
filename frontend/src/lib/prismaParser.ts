/**
 * Prisma Schema Parser
 * Parses Prisma schema definitions and converts them to SchemaSync internal format.
 */

import type { Column, Table } from '../types'

interface PrismaField {
  name: string
  type: string
  isRequired: boolean
  isArray: boolean
  isUnique: boolean
  isPrimaryKey: boolean
  hasDefault: boolean
  defaultValue?: string
  comments?: string
}

interface PrismaModel {
  name: string
  fields: PrismaField[]
  comments?: string
}

/**
 * Map Prisma field types to SQL types
 */
function mapPrismaTypeToSQL(prismaType: string): string {
  const typeMap: Record<string, string> = {
    'Int': 'INT',
    'BigInt': 'BIGINT',
    'Float': 'FLOAT',
    'Decimal': 'DECIMAL',
    'String': 'VARCHAR(255)',
    'Boolean': 'BOOLEAN',
    'DateTime': 'DATETIME',
    'Date': 'DATE',
    'Time': 'TIME',
    'Json': 'JSON',
    'Bytes': 'BLOB',
    'Unsupported': 'VARCHAR(255)',
  }

  return typeMap[prismaType] || 'VARCHAR(255)'
}

/**
 * Extract type and modifiers from Prisma field definition
 */
function parsePrismaFieldType(fieldDef: string): { type: string; isArray: boolean } {
  const isArray = fieldDef.includes('[]')
  const baseType = fieldDef.replace(/\[\]/, '').trim()
  return { type: baseType, isArray }
}

/**
 * Parse a single Prisma model definition
 */
function parsePrismaModel(modelText: string): PrismaModel | null {
  const lines = modelText.split('\n').filter(line => line.trim().length > 0)

  if (lines.length === 0) return null

  const headerMatch = lines[0].match(/model\s+(\w+)/i)
  if (!headerMatch) return null

  const modelName = headerMatch[1]
  const fields: PrismaField[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip closing braces and comments
    if (line === '}' || line.startsWith('//') || line.startsWith('@@')) continue

    // Parse field definition: name Type @decorators
    const match = line.match(/^(\w+)\s+([^@\s]+)(.*?)(?:\/\/\s*(.*))?$/)
    if (!match) continue

    const fieldName = match[1]
    const fieldDef = match[2]
    const decorators = match[3]
    const comment = match[4]

    const { type, isArray } = parsePrismaFieldType(fieldDef)
    const isRequired = !fieldDef.includes('?')
    const isUnique = decorators.includes('@unique')
    const isPrimaryKey = decorators.includes('@id')
    const hasDefault = decorators.includes('@default')

    // Extract default value if present
    let defaultValue: string | undefined
    const defaultMatch = decorators.match(/@default\(([^)]+)\)/)
    if (defaultMatch) {
      defaultValue = defaultMatch[1]
    }

    fields.push({
      name: fieldName,
      type,
      isRequired,
      isArray,
      isUnique,
      isPrimaryKey,
      hasDefault,
      defaultValue,
      comments: comment,
    })
  }

  return { name: modelName, fields, comments: undefined }
}

/**
 * Convert Prisma model to SchemaSync Table format
 */
function prismaModelToTable(model: PrismaModel): Table {
  const columns: Column[] = model.fields.map(field => ({
    name: field.name,
    data_type: {
      base_type: mapPrismaTypeToSQL(field.type),
    },
  }))

  return {
    name: model.name,
    columns,
  }
}

/**
 * Parse entire Prisma schema content
 */
export function parsePrismaSchema(schemaContent: string): Table[] {
  // Split by model definitions
  const modelMatches = schemaContent.match(/model\s+\w+\s*\{[\s\S]*?\n\}/g) || []

  return modelMatches
    .map(modelText => parsePrismaModel(modelText))
    .filter((model): model is PrismaModel => model !== null)
    .map(model => prismaModelToTable(model))
}

/**
 * Validate Prisma schema syntax
 */
export function validatePrismaSchema(schemaContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for required datasource block
  if (!schemaContent.includes('datasource')) {
    errors.push('Missing datasource block')
  }

  // Check for required generator block
  if (!schemaContent.includes('generator')) {
    errors.push('Missing generator block')
  }

  // Check for at least one model
  const modelCount = (schemaContent.match(/model\s+\w+/g) || []).length
  if (modelCount === 0) {
    errors.push('No models defined')
  }

  // Check for unbalanced braces
  const openBraces = (schemaContent.match(/\{/g) || []).length
  const closeBraces = (schemaContent.match(/\}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced braces')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get example Prisma schema for user reference
 */
export function getPrismaExampleSchema(): string {
  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`
}
