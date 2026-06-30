import {readFile} from 'node:fs/promises'

import {DEFAULT_BASE_URL, DEFAULT_TIMEOUT_MS, ENV} from './defaults.js'
import type {AuthSource, OperoConfig, ResolvedSettings} from './types.js'

export type GlobalConfigFlags = {
  'api-token'?: string
  'base-url'?: string
  'company-id'?: string
  'timeout-ms'?: number
}

export async function loadConfig(configPath: string): Promise<OperoConfig> {
  try {
    const raw = await readFile(configPath, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Config file must contain a JSON object')
    }

    return parsed as OperoConfig
  } catch (error) {
    if (isMissingFile(error)) return {}
    throw error
  }
}

export function resolveSettings(args: {
  config: OperoConfig
  configPath: string
  env?: NodeJS.ProcessEnv
  flags: GlobalConfigFlags
}): ResolvedSettings {
  const env = args.env ?? process.env
  const baseUrl = args.flags['base-url'] ?? env[ENV.baseUrl] ?? args.config.baseUrl ?? DEFAULT_BASE_URL
  const companyId = args.flags['company-id'] ?? env[ENV.companyId] ?? args.config.companyId
  const timeoutMs = parseTimeout(args.flags['timeout-ms'] ?? env[ENV.timeoutMs] ?? args.config.timeoutMs)
  const tokenResolution = resolveApiToken(args.flags['api-token'], env[ENV.apiToken], args.config.apiToken)

  return {
    apiToken: tokenResolution.apiToken,
    authSource: tokenResolution.authSource,
    baseUrl: normalizeBaseUrl(baseUrl),
    ...(companyId ? {companyId} : {}),
    configPath: args.configPath,
    timeoutMs,
  }
}

function resolveApiToken(flagToken?: string, envToken?: string, configToken?: string): {
  apiToken?: string
  authSource: AuthSource
} {
  if (flagToken) return {apiToken: flagToken, authSource: 'flag'}
  if (envToken) return {apiToken: envToken, authSource: 'env'}
  if (configToken) return {apiToken: configToken, authSource: 'config'}
  return {authSource: 'missing'}
}

function parseTimeout(value: number | string | undefined): number {
  if (value === undefined) return DEFAULT_TIMEOUT_MS
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Timeout must be a positive number')
  }

  return Math.trunc(parsed)
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

function isMissingFile(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
}
