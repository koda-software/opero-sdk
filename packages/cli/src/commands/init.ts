import {Flags} from '@oclif/core'

import {BaseCommand} from '../base-command.js'
import {DEFAULT_BASE_URL} from '../config/defaults.js'
import {writeConfig} from '../config/write.js'

export default class Init extends BaseCommand {
  static description = 'Configure Opero CLI defaults.'
  static enableJsonFlag = true
  static flags = {
    'base-url': Flags.string({
      default: DEFAULT_BASE_URL,
      description: 'Opero API base URL to save.',
    }),
    'timeout-ms': Flags.integer({
      description: 'HTTP request timeout in milliseconds.',
    }),
  }

  async run(): Promise<{data: {baseUrl: string; configPath: string; timeoutMs?: number}}> {
    const {flags} = await this.parse(Init)
    const {config} = await this.loadSettings(flags)
    const nextConfig = {
      ...config,
      baseUrl: flags['base-url'],
      ...(flags['timeout-ms'] ? {timeoutMs: flags['timeout-ms']} : {}),
    }

    await writeConfig(this.configPath, nextConfig)

    const result = {
      data: {
        baseUrl: nextConfig.baseUrl,
        configPath: this.configPath,
        ...(nextConfig.timeoutMs ? {timeoutMs: nextConfig.timeoutMs} : {}),
      },
    }

    if (!this.jsonEnabled()) this.log(`Saved Opero config to ${this.configPath}`)
    return result
  }
}
