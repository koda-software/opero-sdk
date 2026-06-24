import {BaseCommand} from '../base-command.js'

export default class Ping extends BaseCommand {
  static description = 'Check authenticated Opero API access.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {flags} = await this.parse(Ping)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get('/v1/ping')

    if (!this.jsonEnabled()) this.printHuman(result)
    return result
  }
}
