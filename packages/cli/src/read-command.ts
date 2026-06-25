import {BaseCommand} from './base-command.js'
import type {Query} from './api/query.js'

export abstract class ReadCommand extends BaseCommand {
  protected async getJson(path: string, flags: Record<string, unknown>, query?: Query): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get(path, {query})

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
