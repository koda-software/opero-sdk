import {Flags} from '@oclif/core'

import {OperoCliError} from '../../api/errors.js'
import {readJsonBodyFile} from '../../api/payload.js'
import type {Query} from '../../api/query.js'

const FILTER_FIELDS = new Set(['id', 'name', 'slug', 'status', 'isDefault', 'createdAt'])
const SORT_FIELDS = FILTER_FIELDS

export const COMPANY_REQUEST_OPTIONS = {
  companyScoped: false,
} as const

export const companyBodyFlags = {
  'body-file': Flags.string({
    description: 'JSON request body file. Use - to read from stdin.',
  }),
  'is-default': Flags.boolean({
    description: 'Make this company the organization default.',
    exclusive: ['body-file'],
  }),
  krs: Flags.string({
    description: 'Company KRS number.',
    exclusive: ['body-file'],
  }),
  name: Flags.string({
    description: 'Company name.',
    exclusive: ['body-file'],
  }),
  nip: Flags.string({
    description: 'Company NIP/tax identifier.',
    exclusive: ['body-file'],
  }),
  regon: Flags.string({
    description: 'Company REGON number.',
    exclusive: ['body-file'],
  }),
  slug: Flags.string({
    description: 'Globally unique URL-safe company slug. Backend derives it from name when omitted.',
    exclusive: ['body-file'],
  }),
  status: Flags.string({
    description: 'Company status.',
    exclusive: ['body-file'],
    options: ['ACTIVE', 'INACTIVE'],
  }),
  'tax-country': Flags.string({
    description: 'Tax country code, for example PL.',
    exclusive: ['body-file'],
  }),
}

export type CompanyBodyFlags = {
  'body-file'?: string
  'is-default'?: boolean
  krs?: string
  name?: string
  nip?: string
  regon?: string
  slug?: string
  status?: string
  'tax-country'?: string
}

export const companyListFlags = {
  filter: Flags.string({
    description: 'Simple equality filter as field=value. May be repeated. Supported fields: id,name,slug,status,isDefault,createdAt.',
    multiple: true,
  }),
  sort: Flags.string({
    description: 'Simple sort as field:asc or field:desc. May be repeated. Supported fields: id,name,slug,status,isDefault,createdAt.',
    multiple: true,
  }),
}

export type CompanyListShortcutFlags = {
  filter?: string[]
  sort?: string[]
}

export async function buildCompanyCreateBody(flags: CompanyBodyFlags): Promise<unknown> {
  if (flags['body-file']) return readJsonBodyFile(flags['body-file'])
  if (!flags.name) {
    throw new OperoCliError({
      code: 'USAGE_ERROR',
      exitCode: 2,
      message: 'Provide --name or --body-file.',
    })
  }

  return buildCompanyBody(flags, true)
}

export async function buildCompanyUpdateBody(flags: CompanyBodyFlags): Promise<unknown> {
  if (flags['body-file']) return readJsonBodyFile(flags['body-file'])
  const body = buildCompanyBody(flags, false)
  if (Object.keys(body).length === 0) {
    throw new OperoCliError({
      code: 'USAGE_ERROR',
      exitCode: 2,
      message: 'Provide at least one company field or --body-file.',
    })
  }

  return body
}

export function buildCompanyListShortcuts(flags: CompanyListShortcutFlags): Query {
  return {
    ...(flags.filter && flags.filter.length > 0 ? {filters: JSON.stringify({op: 'AND', items: flags.filter.map(parseFilter)})} : {}),
    ...(flags.sort && flags.sort.length > 0 ? {sort: JSON.stringify(flags.sort.map(parseSort))} : {}),
  }
}

function buildCompanyBody(flags: CompanyBodyFlags, includeDefault: boolean): Record<string, unknown> {
  return compact({
    ...(includeDefault || flags.name ? {name: flags.name} : {}),
    slug: flags.slug,
    status: flags.status,
    ...(flags['is-default'] ? {isDefault: true} : {}),
    nip: flags.nip,
    taxCountry: flags['tax-country'],
    regon: flags.regon,
    krs: flags.krs,
  })
}

function compact(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined))
}

function parseFilter(value: string): {field: string; operator: 'eq'; value: boolean | string} {
  const index = value.indexOf('=')
  if (index <= 0) {
    throw new OperoCliError({
      code: 'USAGE_ERROR',
      exitCode: 2,
      message: '--filter must use field=value syntax',
    })
  }

  const field = value.slice(0, index)
  assertField('--filter', field, FILTER_FIELDS)
  return {
    field,
    operator: 'eq',
    value: field === 'isDefault' ? parseBoolean(value.slice(index + 1)) : value.slice(index + 1),
  }
}

function parseSort(value: string): {direction: 'asc' | 'desc'; field: string} {
  const [field, direction = 'asc'] = value.split(':')
  assertField('--sort', field, SORT_FIELDS)
  if (direction !== 'asc' && direction !== 'desc') {
    throw new OperoCliError({
      code: 'USAGE_ERROR',
      exitCode: 2,
      message: '--sort direction must be asc or desc',
    })
  }

  return {direction, field}
}

function assertField(flag: string, field: string, allowed: Set<string>): void {
  if (!allowed.has(field)) {
    throw new OperoCliError({
      code: 'USAGE_ERROR',
      exitCode: 2,
      message: `${flag} field must be one of ${[...allowed].join(', ')}`,
    })
  }
}

function parseBoolean(value: string): boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new OperoCliError({
    code: 'USAGE_ERROR',
    exitCode: 2,
    message: 'isDefault filter value must be true or false',
  })
}
