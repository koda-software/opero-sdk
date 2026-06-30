import {BaseCommand} from '../../base-command.js'
import {redactToken} from '../../api/redaction.js'

export default class AuthStatus extends BaseCommand {
  static description = 'Show Opero auth configuration status.'
  static enableJsonFlag = true

  async run(): Promise<{data: {available: boolean; baseUrl: string; companyId?: string; configPath: string; source: string; token?: string}}> {
    const {flags} = await this.parse(AuthStatus)
    const {settings} = await this.loadSettings(flags)
    const result = {
      data: {
        available: Boolean(settings.apiToken),
        baseUrl: settings.baseUrl,
        ...(settings.companyId ? {companyId: settings.companyId} : {}),
        configPath: settings.configPath,
        source: settings.authSource,
        ...(settings.apiToken ? {token: redactToken(settings.apiToken)} : {}),
      },
    }

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
