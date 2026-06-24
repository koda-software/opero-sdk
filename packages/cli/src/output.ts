import {printTable} from '@oclif/table'
import {ux} from '@oclif/core/ux'
import pc from 'picocolors'

export type OutputFormatFlags = {
  table?: boolean
}

type ApiEnvelope = {
  data?: unknown
  meta?: unknown
}

type Row = Record<string, unknown>

const PRIORITY_COLUMNS = [
  'id',
  'key',
  'code',
  'uniqueId',
  'name',
  'fullName',
  'acronym',
  'status',
  'type',
  'contractorType',
  'createdAt',
  'updatedAt',
]

export function renderOutput(value: unknown, flags: OutputFormatFlags = {}): void {
  if (flags.table) {
    renderTableOutput(value)
    return
  }

  renderHumanOutput(value)
}

export function renderHumanOutput(value: unknown): void {
  const {data, meta} = unwrapEnvelope(value)

  if (Array.isArray(data)) {
    renderHumanList(data, meta)
    return
  }

  if (isPlainObject(data)) {
    renderHumanObject(data)
    return
  }

  ux.stdout(formatScalar(data))
}

export function renderTableOutput(value: unknown): void {
  const {data, meta} = unwrapEnvelope(value)

  if (Array.isArray(data)) {
    renderTableRows(data, meta)
    return
  }

  if (isPlainObject(data)) {
    const rows = Object.entries(data).map(([key, item]) => ({
      key,
      value: formatScalar(item),
    }))
    renderTableRows(rows, meta, ['key', 'value'])
    return
  }

  renderTableRows([{value: formatScalar(data)}], meta, ['value'])
}

function renderHumanList(items: unknown[], meta: unknown): void {
  if (items.length === 0) {
    ux.stdout(pc.dim('No items found.'))
    renderMeta(meta)
    return
  }

  ux.stdout(`${pc.bold(pc.cyan(`${items.length} item${items.length === 1 ? '' : 's'}`))}`)
  for (const item of items.slice(0, 20)) {
    if (!isPlainObject(item)) {
      ux.stdout(`${pc.dim('-')} ${formatScalar(item)}`)
      continue
    }

    ux.stdout(`${pc.dim('-')} ${pc.cyan(getHumanTitle(item))}`)
    const fields = getSummaryFields(item)
    for (const [key, fieldValue] of fields) {
      ux.stdout(`  ${pc.dim(key)}: ${formatScalar(fieldValue)}`)
    }
  }

  if (items.length > 20) {
    ux.stdout(pc.dim(`Showing first 20 of ${items.length} items.`))
  }

  renderMeta(meta)
}

function renderHumanObject(value: Row): void {
  const title = getHumanTitle(value)
  if (title !== 'Object') ux.stdout(pc.cyan(pc.bold(title)))

  for (const [key, item] of Object.entries(value)) {
    ux.stdout(`${pc.dim(key.padEnd(Math.min(maxKeyLength(value), 24)))}  ${formatScalar(item)}`)
  }
}

function renderTableRows(items: unknown[], meta: unknown, explicitColumns?: string[]): void {
  const rows = normalizeRows(items)
  if (rows.length === 0) {
    ux.stdout(pc.dim('No rows.'))
    renderMeta(meta)
    return
  }

  const columns = explicitColumns ?? inferColumns(rows)
  printTable({
    borderColor: 'gray',
    borderStyle: 'headers-only-with-underline',
    columns: columns.map((key) => ({key, overflow: key === 'id' ? 'truncate-middle' : 'truncate-end'})),
    data: rows.map((row) => pickColumns(row, columns)),
    headerOptions: {
      color: 'cyan',
      formatter: 'capitalCase',
    },
    maxWidth: '100%',
    overflow: 'truncate-end',
  })
  renderMeta(meta)
}

function renderMeta(meta: unknown): void {
  if (!isPlainObject(meta)) return
  const parts = Object.entries(meta).map(([key, value]) => `${key}=${formatScalar(value)}`)
  if (parts.length > 0) ux.stdout(pc.dim(parts.join(' ')))
}

function unwrapEnvelope(value: unknown): {data: unknown; meta?: unknown} {
  if (isPlainObject(value) && 'data' in value) {
    const envelope = value as ApiEnvelope
    return {data: envelope.data, meta: envelope.meta}
  }

  return {data: value}
}

function normalizeRows(items: unknown[]): Row[] {
  return items.map((item) => {
    if (isPlainObject(item)) {
      return Object.fromEntries(Object.entries(item).map(([key, value]) => [key, formatScalar(value)]))
    }

    return {value: formatScalar(item)}
  })
}

function inferColumns(rows: Row[]): string[] {
  const keys = new Set<string>()
  for (const row of rows.slice(0, 20)) {
    for (const key of Object.keys(row)) keys.add(key)
  }

  const sorted = [...keys].sort((left, right) => {
    const leftIndex = PRIORITY_COLUMNS.indexOf(left)
    const rightIndex = PRIORITY_COLUMNS.indexOf(right)
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right)
    if (leftIndex === -1) return 1
    if (rightIndex === -1) return -1
    return leftIndex - rightIndex
  })

  return sorted.slice(0, 8)
}

function pickColumns(row: Row, columns: string[]): Row {
  return Object.fromEntries(columns.map((key) => [key, row[key] ?? '']))
}

function getHumanTitle(value: Row): string {
  for (const key of ['name', 'fullName', 'code', 'uniqueId', 'key', 'id']) {
    const item = value[key]
    if (typeof item === 'string' && item.length > 0) return item
  }

  return 'Object'
}

function getSummaryFields(value: Row): [string, unknown][] {
  return Object.entries(value)
    .filter(([key]) => !['name', 'fullName'].includes(key))
    .filter(([, item]) => item === null || ['boolean', 'number', 'string'].includes(typeof item))
    .slice(0, 6)
}

function formatScalar(value: unknown): string {
  if (value === null) return pc.dim('null')
  if (value === undefined) return pc.dim('undefined')
  if (typeof value === 'boolean') return value ? pc.green('true') : pc.red('false')
  if (typeof value === 'number') return pc.yellow(String(value))
  if (typeof value === 'string') return formatString(value)
  return JSON.stringify(value)
}

function isPlainObject(value: unknown): value is Row {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function formatString(value: string): string {
  if (['ACTIVE', 'VALID', 'SUCCESS', 'OK', 'UP'].includes(value.toUpperCase())) return pc.green(value)
  if (['ARCHIVED', 'SKIPPED', 'PENDING'].includes(value.toUpperCase())) return pc.yellow(value)
  if (['ERROR', 'FAILED', 'INVALID', 'DOWN', 'INACTIVE'].includes(value.toUpperCase())) return pc.red(value)
  if (value.startsWith('http://') || value.startsWith('https://')) return pc.cyan(value)
  return value
}

function maxKeyLength(value: Row): number {
  return Math.max(...Object.keys(value).map((key) => key.length), 0)
}
