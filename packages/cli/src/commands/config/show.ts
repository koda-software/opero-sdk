import {BaseCommand} from '../../base-command.js'

export default class ConfigShow extends BaseCommand {
  static description = 'Show resolved Opero CLI configuration.'
  static enableJsonFlag = true

  async run(): Promise<{data: {baseUrl: string; companyId?: string; configPath: string; timeoutMs: number}}> {
    const {flags} = await this.parse(ConfigShow)
    const {settings} = await this.loadSettings(flags)
    const result = {
      data: {
        baseUrl: settings.baseUrl,
        ...(settings.companyId ? {companyId: settings.companyId} : {}),
        configPath: settings.configPath,
        timeoutMs: settings.timeoutMs,
      },
    }

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
