import {Command, Flags, type Interfaces} from '@oclif/core'
import {join} from 'node:path'
import pc from 'picocolors'

import {ApiClient} from './api/client.js'
import {OperoCliError} from './api/errors.js'
import {loadConfig, type GlobalConfigFlags, resolveSettings} from './config/load.js'
import type {OperoConfig, ResolvedSettings} from './config/types.js'
import {renderOutput, type OutputFormatFlags} from './output.js'
import {type BackgroundUpdateCheck, startBackgroundUpdateCheck} from './update/background.js'

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

  private backgroundUpdateCheck?: BackgroundUpdateCheck

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

  protected async finally(error: Error | undefined): Promise<void> {
    if (error) {
      this.backgroundUpdateCheck?.abort()
      return
    }

    const check = this.backgroundUpdateCheck
    if (!check) return

    const notice = await Promise.race([check.promise, sleep(250)])
    if (!notice) {
      check.abort()
      return
    }

    process.stderr.write(
      `${pc.cyan('Update available')}: ${notice.latestVersion} ` +
        `${pc.dim(`(current ${notice.currentVersion}, ${notice.target})`)}. Run ${pc.bold('opero update')}.\n`,
    )
  }

  async init(): Promise<void> {
    await super.init()
    this.backgroundUpdateCheck = startBackgroundUpdateCheck({
      commandId: this.id,
      configDir: this.config.configDir,
      currentVersion: `v${this.config.version}`,
      jsonEnabled: this.jsonEnabled(),
      stderrIsTTY: process.stderr.isTTY,
      stdinIsTTY: process.stdin.isTTY,
      stdoutIsTTY: process.stdout.isTTY,
    })
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

async function sleep(ms: number): Promise<undefined> {
  return await new Promise((resolve) => {
    setTimeout(() => resolve(undefined), ms)
  })
}
