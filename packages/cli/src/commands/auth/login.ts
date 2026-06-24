import {BaseCommand} from '../../base-command.js'
import {OperoCliError} from '../../api/errors.js'
import {validateAndSaveToken} from '../../config/save-token.js'

export default class AuthLogin extends BaseCommand {
  static description = 'Validate and save an Opero API token.'
  static enableJsonFlag = true

  async run(): Promise<{data: {baseUrl: string; configPath: string; saved: boolean}}> {
    const {flags} = await this.parse(AuthLogin)
    if (!flags['api-token']) {
      throw new OperoCliError({
        code: 'USAGE_ERROR',
        exitCode: 2,
        message: 'Missing --api-token. You can also use OPERO_API_TOKEN for one-off commands.',
      })
    }

    const {config, settings} = await this.loadSettings(flags)
    const client = this.createApiClient({...settings, apiToken: flags['api-token']})
    await validateAndSaveToken({
      apiToken: flags['api-token'],
      client,
      config,
      configPath: this.configPath,
      settings,
    })

    const result = {
      data: {
        baseUrl: settings.baseUrl,
        configPath: this.configPath,
        saved: true,
      },
    }

    if (!this.jsonEnabled()) this.log(`Saved Opero API token to ${this.configPath}`)
    return result
  }
}
