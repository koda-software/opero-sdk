import {Args, Flags} from '@oclif/core'

import {parseHeaderPairs} from './api/headers.js'
import {readJsonBodyFile} from './api/payload.js'
import {parseQueryPairs} from './api/query.js'
import {BaseCommand} from './base-command.js'

export const rawRequestArgs = {
  path: Args.string({
    description: 'API path, for example /v1/companies/<companyId>/contractors.',
    required: true,
  }),
}

export const rawRequestFlags = {
  'body-file': Flags.string({
    description: 'JSON request body file. Use - to read from stdin.',
  }),
  header: Flags.string({
    char: 'H',
    description: 'Additional header as name=value. Authorization is managed by the CLI.',
    multiple: true,
  }),
  query: Flags.string({
    char: 'q',
    description: 'Query parameter as key=value. May be repeated.',
    multiple: true,
  }),
}

export abstract class RawRequestCommand extends BaseCommand {
  protected async runRawRequest(command: typeof RawRequestCommand, method: 'DELETE' | 'GET' | 'PATCH' | 'POST'): Promise<unknown> {
    const {args, flags} = await this.parse(command)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.request(method, args.path, {
      body: await readJsonBodyFile(flags['body-file']),
      headers: parseHeaderPairs(flags.header),
      query: parseQueryPairs(flags.query),
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
