import {OperoCliError} from './errors.js'

export type QueryValue = boolean | number | string | undefined
export type Query = Record<string, QueryValue | QueryValue[]>

export function parseQueryPairs(pairs: string[] | undefined): Query {
  const query: Query = {}
  for (const pair of pairs ?? []) {
    const index = pair.indexOf('=')
    if (index <= 0) {
      throw new OperoCliError({
        code: 'USAGE_ERROR',
        exitCode: 2,
        message: `Invalid query pair "${pair}". Use key=value.`,
      })
    }

    const key = pair.slice(0, index)
    const value = pair.slice(index + 1)
    const existing = query[key]
    if (existing === undefined) {
      query[key] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      query[key] = [existing, value]
    }
  }

  return query
}

export function appendQuery(searchParams: URLSearchParams, query: Query | undefined): void {
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined) continue
    const values = Array.isArray(value) ? value : [value]
    for (const item of values) {
      if (item === undefined) continue
      searchParams.append(key, String(item))
    }
  }
}
