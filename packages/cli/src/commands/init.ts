import {Flags} from '@oclif/core'

import {BaseCommand} from '../base-command.js'
import {DEFAULT_BASE_URL} from '../config/defaults.js'
import {OperoCliError} from '../api/errors.js'
import {promptSecret, promptText} from '../cli/prompts.js'
import {resolveSettings} from '../config/load.js'
import {validateAndSaveToken} from '../config/save-token.js'
import {writeConfig} from '../config/write.js'

export default class Init extends BaseCommand {
  static description = 'Interactively configure Opero API base URL and token.'
  static enableJsonFlag = true
  static flags = {
    'api-token': Flags.string({
      description: 'Opero API token to validate and save. Prefer interactive prompt for regular use.',
    }),
    'base-url': Flags.string({
      description: 'Opero API base URL to save.',
    }),
    'no-token': Flags.boolean({
      description: 'Save base URL without prompting for or validating an API token.',
    }),
    'timeout-ms': Flags.integer({
      description: 'HTTP request timeout in milliseconds.',
    }),
  }

  async run(): Promise<{data: {baseUrl: string; configPath: string; savedToken: boolean; timeoutMs?: number}}> {
    const {flags} = await this.parse(Init)
    const {config} = await this.loadSettings(flags)
    const baseUrl = flags['base-url'] ?? (await promptText('Opero API base URL', config.baseUrl ?? DEFAULT_BASE_URL))
    const apiToken = flags['no-token'] ? undefined : flags['api-token'] ?? (await promptSecret('Opero API token'))

    if (!baseUrl) {
      throw new OperoCliError({
        code: 'USAGE_ERROR',
        exitCode: 2,
        message: 'Base URL is required',
      })
    }

    const settings = resolveSettings({
      config,
      configPath: this.configPath,
      flags: {
        'api-token': apiToken,
        'base-url': baseUrl,
        'timeout-ms': flags['timeout-ms'],
      },
    })

    const client = this.createApiClient(settings)
    if (apiToken) {
      await validateAndSaveToken({
        apiToken,
        client,
        config,
        configPath: this.configPath,
        settings,
      })
    } else {
      await writeConfig(this.configPath, {
        ...config,
        baseUrl: settings.baseUrl,
        timeoutMs: settings.timeoutMs,
      })
    }

    const result = {
      data: {
        baseUrl: settings.baseUrl,
        configPath: this.configPath,
        savedToken: Boolean(apiToken),
        ...(settings.timeoutMs ? {timeoutMs: settings.timeoutMs} : {}),
      },
    }

    if (!this.jsonEnabled()) this.log(`Saved Opero config to ${this.configPath}`)
    return result
  }
}
