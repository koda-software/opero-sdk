import {BaseCommand} from '../base-command.js'

export default class Health extends BaseCommand {
  static description = 'Check public Opero API health.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {flags} = await this.parse(Health)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get('/v1/health', {authRequired: false})

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
