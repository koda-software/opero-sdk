import {BaseCommand} from '../../base-command.js'
import {writeConfig} from '../../config/write.js'

export default class AuthLogout extends BaseCommand {
  static description = 'Remove saved Opero API token from config.'
  static enableJsonFlag = true

  async run(): Promise<{data: {configPath: string; removed: boolean}}> {
    const {flags} = await this.parse(AuthLogout)
    const {config} = await this.loadSettings(flags)
    const nextConfig = {...config}
    const removed = Boolean(nextConfig.apiToken)
    delete nextConfig.apiToken
    await writeConfig(this.configPath, nextConfig)

    const result = {data: {configPath: this.configPath, removed}}
    if (!this.jsonEnabled()) this.log(removed ? 'Removed saved Opero API token' : 'No saved Opero API token found')
    return result
  }
}
