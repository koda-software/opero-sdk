import {BaseCommand} from '../base-command.js'
import {OperoCliError} from '../api/errors.js'

type ProbeResult = {
  error?: {
    code: string
    message: string
    status?: number
  }
  ok: boolean
  status?: number
}

export default class Doctor extends BaseCommand {
  static description = 'Verify Opero CLI config, auth, and API reachability.'
  static enableJsonFlag = true

  async run(): Promise<{
    data: {
      api: {
        authenticatedPing: ProbeResult
        health: ProbeResult
      }
      auth: {
        available: boolean
        source: string
      }
      cli: {
        name: string
        version: string
      }
      config: {
        baseUrl: string
        configPath: string
        timeoutMs: number
      }
    }
  }> {
    const {flags} = await this.parse(Doctor)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)

    const health = await probe(() => client.get('/v1/health', {authRequired: false}))
    const authenticatedPing = settings.apiToken ? await probe(() => client.get('/v1/ping')) : {ok: false, error: {code: 'MISSING_AUTH', message: 'No API token configured'}}

    const result = {
      data: {
        api: {
          authenticatedPing,
          health,
        },
        auth: {
          available: Boolean(settings.apiToken),
          source: settings.authSource,
        },
        cli: {
          name: this.config.bin,
          version: this.config.version,
        },
        config: {
          baseUrl: settings.baseUrl,
          configPath: settings.configPath,
          timeoutMs: settings.timeoutMs,
        },
      },
    }

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}

async function probe(fn: () => Promise<unknown>): Promise<ProbeResult> {
  try {
    await fn()
    return {ok: true, status: 200}
  } catch (error) {
    if (error instanceof OperoCliError) {
      return {
        error: {
          code: error.code,
          message: error.message,
          ...(error.status ? {status: error.status} : {}),
        },
        ok: false,
        ...(error.status ? {status: error.status} : {}),
      }
    }

    return {error: {code: 'UNEXPECTED_ERROR', message: error instanceof Error ? error.message : 'Unknown error'}, ok: false}
  }
}
