import {Command, Flags, type Interfaces} from '@oclif/core'
import {join} from 'node:path'
import pc from 'picocolors'

import {ApiClient} from './api/client.js'
import {OperoCliError} from './api/errors.js'
import {apiPath} from './api/path.js'
import {loadConfig, type GlobalConfigFlags, resolveSettings} from './config/load.js'
import type {OperoConfig, ResolvedSettings} from './config/types.js'
import {renderOutput, type OutputFormatFlags} from './output.js'
import {checkForUpdateNoticeWithTimeout, shouldCheckForUpdates} from './update/background.js'
import {promptUpdateChoice, runUpdateNow} from './update/interactive.js'

export abstract class BaseCommand extends Command {
  static baseFlags = {
    'api-token': Flags.string({
      description: 'Opero API token. Prefer OPERO_API_TOKEN or opero auth login for regular use.',
    }),
    'base-url': Flags.string({
      description: 'Opero API base URL.',
    }),
    'company-id': Flags.string({
      description: 'Target company ID for company-scoped runtime endpoints. Can also be set with OPERO_COMPANY_ID.',
    }),
    table: Flags.boolean({
      description: 'Format output as a table for human scanning.',
    }),
    'timeout-ms': Flags.integer({
      description: 'HTTP request timeout in milliseconds.',
    }),
  }

  protected get configPath(): string {
    return join(this.config.configDir, 'config.json')
  }

  protected async catch(error: Error & {exitCode?: number}): Promise<unknown> {
    const normalized = normalizeError(error)
    if (this.jsonEnabled()) {
      process.stdout.write(`${JSON.stringify(normalized.toJson(), null, 2)}\n`)
      this.exit(normalized.exitCode)
    }

    this.error(normalized.message, {exit: normalized.exitCode})
  }

  protected createApiClient(settings: ResolvedSettings): ApiClient {
    return new ApiClient({
      apiToken: settings.apiToken,
      baseUrl: settings.baseUrl,
      companyId: settings.companyId,
      timeoutMs: settings.timeoutMs,
      userAgent: `${this.config.bin}/${this.config.version}`,
    })
  }

  protected companyApiPath(template: string, settings: ResolvedSettings, values: Record<string, string> = {}): string {
    return apiPath(template, {
      ...values,
      companyId: this.requireCompanyId(settings),
    })
  }

  async init(): Promise<void> {
    await super.init()
    await this.maybeOfferUpdate()
  }

  protected async maybeOfferUpdate(): Promise<void> {
    const options = {
      commandId: this.id,
      configDir: this.config.configDir,
      currentVersion: `v${this.config.version}`,
      jsonEnabled: this.jsonEnabled(),
      stderrIsTTY: process.stderr.isTTY,
      stdinIsTTY: process.stdin.isTTY,
      stdoutIsTTY: process.stdout.isTTY,
    }

    if (!shouldCheckForUpdates(options)) return

    const notice = await checkForUpdateNoticeWithTimeout(options)
    if (!notice) return

    const choice = await promptUpdateChoice(notice).catch(() => 'skip' as const)
    if (choice === 'skip') return

    const result = runUpdateNow({cwd: process.cwd()})
    if (result.status === 'updated') return

    const detail = result.error ?? (result.exitCode === undefined ? 'unknown error' : `exit code ${result.exitCode}`)
    process.stderr.write(`${pc.yellow('Update failed')}: ${detail}. Continuing with the current command.\n`)
  }

  protected async loadSettings(flags: GlobalConfigFlags): Promise<{config: OperoConfig; settings: ResolvedSettings}> {
    try {
      const config = await loadConfig(this.configPath)
      return {
        config,
        settings: resolveSettings({
          config,
          configPath: this.configPath,
          flags,
        }),
      }
    } catch (error) {
      if (error instanceof OperoCliError) throw error
      throw new OperoCliError({
        code: 'CONFIG_ERROR',
        details: error instanceof Error ? error.message : undefined,
        exitCode: 3,
        message: 'Could not load Opero CLI config',
      })
    }
  }

  protected printHuman(value: unknown): void {
    renderOutput(value)
  }

  protected printOutput(value: unknown, flags: OutputFormatFlags): void {
    renderOutput(value, flags)
  }

  private requireCompanyId(settings: ResolvedSettings): string {
    if (settings.companyId) return settings.companyId
    throw new OperoCliError({
      code: 'USAGE_ERROR',
      exitCode: 2,
      message: 'This endpoint requires a company. Run opero companies select <companyId>, pass --company-id, or set OPERO_COMPANY_ID.',
    })
  }
}

export type ParsedFlags<T extends typeof BaseCommand> = Interfaces.InferredFlags<(typeof BaseCommand)['baseFlags'] & T['flags']>

function normalizeError(error: Error & {exitCode?: number}): OperoCliError {
  if (error instanceof OperoCliError) return error
  return new OperoCliError({
    code: error.exitCode === 2 ? 'USAGE_ERROR' : 'UNEXPECTED_ERROR',
    details: process.env.DEBUG ? error.stack : undefined,
    exitCode: error.exitCode ?? 1,
    message: error.message || 'Unexpected CLI failure',
  })
}
