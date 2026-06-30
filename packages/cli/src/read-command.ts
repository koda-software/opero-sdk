import {BaseCommand} from './base-command.js'
import type {RequestOptions} from './api/client.js'
import type {Query} from './api/query.js'

export abstract class ReadCommand extends BaseCommand {
  protected async getJson(path: string, flags: Record<string, unknown>, query?: Query, options: Omit<RequestOptions, 'query'> = {}): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get(path, {...options, query})

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
