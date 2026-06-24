import {OperoCliError} from './errors.js'

export function parseHeaderPairs(pairs: string[] | undefined): Record<string, string> {
  const headers: Record<string, string> = {}
  for (const pair of pairs ?? []) {
    const index = pair.indexOf('=')
    if (index <= 0) {
      throw new OperoCliError({
        code: 'USAGE_ERROR',
        exitCode: 2,
        message: `Invalid header pair "${pair}". Use name=value.`,
      })
    }

    const name = pair.slice(0, index).trim()
    const value = pair.slice(index + 1)
    if (name.toLowerCase() === 'authorization') {
      throw new OperoCliError({
        code: 'USAGE_ERROR',
        exitCode: 2,
        message: 'Do not pass Authorization manually. Use OPERO_API_TOKEN or opero auth login.',
      })
    }

    headers[name] = value
  }

  return headers
}
