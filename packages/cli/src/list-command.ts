import {Flags} from '@oclif/core'

import type {RequestOptions} from './api/client.js'
import {OperoCliError} from './api/errors.js'
import type {Query} from './api/query.js'
import {BaseCommand} from './base-command.js'
import type {GlobalConfigFlags} from './config/load.js'
import type {OutputFormatFlags} from './output.js'

export const listFlags = {
  columns: Flags.string({
    description: 'Comma-separated columns or JSON array of columns.',
  }),
  count: Flags.string({
    description: 'Count strategy.',
    options: ['exact', 'none', 'hasMore'],
  }),
  'filter-json': Flags.string({
    description: 'JSON-encoded recursive filter tree.',
  }),
  limit: Flags.integer({
    description: 'Items per page.',
    min: 1,
  }),
  page: Flags.integer({
    description: 'Page number, 1-based.',
    min: 1,
  }),
  'sort-json': Flags.string({
    description: 'JSON-encoded ordered sort rule list.',
  }),
}

export type ListFlagValues = {
  columns?: string
  count?: string
  'filter-json'?: string
  limit?: number
  page?: number
  'sort-json'?: string
}

export abstract class ListCommand extends BaseCommand {
  protected buildListQuery(flags: ListFlagValues, extra: Query = {}): Query {
    return {
      ...extra,
      ...(flags.page ? {page: flags.page} : {}),
      ...(flags.limit ? {limit: flags.limit} : {}),
      ...(flags.count ? {count: normalizeCount(flags.count)} : {}),
      ...(flags['filter-json'] ? {filters: normalizeJsonFlag(flags['filter-json'], '--filter-json')} : {}),
      ...(flags['sort-json'] ? {sort: normalizeJsonFlag(flags['sort-json'], '--sort-json')} : {}),
      ...(flags.columns ? {columns: normalizeColumns(flags.columns)} : {}),
    }
  }

  protected async getList(
    path: string,
    flags: ListFlagValues & GlobalConfigFlags & OutputFormatFlags,
    extra: Query = {},
    options: Omit<RequestOptions, 'query'> = {},
  ): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get(path, {...options, query: this.buildListQuery(flags, extra)})

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}

function normalizeCount(value: string): string {
  if (['exact', 'none', 'hasMore'].includes(value)) return value
  throw new OperoCliError({
    code: 'USAGE_ERROR',
    exitCode: 2,
    message: '--count must be one of exact, none, hasMore',
  })
}

function normalizeJsonFlag(value: string, flagName: string): string {
  try {
    JSON.parse(value)
    return value
  } catch (error) {
    throw new OperoCliError({
      code: 'INVALID_JSON',
      details: error instanceof Error ? error.message : undefined,
      exitCode: 2,
      message: `${flagName} must be valid JSON`,
    })
  }
}

function normalizeColumns(value: string): string {
  const trimmed = value.trim()
  if (trimmed.startsWith('[')) {
    return normalizeJsonFlag(trimmed, '--columns')
  }

  return JSON.stringify(
    trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  )
}
