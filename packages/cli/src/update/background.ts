import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'

import {fetchRelease, findReleaseAsset} from './github.js'
import {currentInstallLayout} from './platform.js'
import {isSourceCheckout} from './source-checkout.js'

const DEFAULT_INTERVAL_MS = 60 * 60 * 1000
const DEFAULT_TIMEOUT_MS = 1200

export type UpdateNotice = {
  currentVersion: string
  latestVersion: string
  target: string
}

export type BackgroundUpdateCheck = {
  abort: () => void
  promise: Promise<UpdateNotice | undefined>
}

type State = {
  lastCheckedAt?: string
}

type StartOptions = {
  commandId?: string
  configDir: string
  currentVersion: string
  env?: NodeJS.ProcessEnv
  jsonEnabled: boolean
  now?: Date
  stderrIsTTY?: boolean
  stdinIsTTY?: boolean
  stdoutIsTTY?: boolean
}

export function startBackgroundUpdateCheck(options: StartOptions): BackgroundUpdateCheck | undefined {
  if (!shouldCheckForUpdates(options)) return undefined

  const controller = new AbortController()
  const promise = checkForUpdateNoticeWithTimeout(options, controller)

  return {
    abort: () => controller.abort(),
    promise,
  }
}

export async function checkForUpdateNoticeWithTimeout(
  options: StartOptions,
  controller = new AbortController(),
): Promise<UpdateNotice | undefined> {
  const timeout = setTimeout(() => controller.abort(), readTimeoutMs(options.env))
  return await checkForUpdateNotice({
    ...options,
    signal: controller.signal,
  })
    .catch(() => undefined)
    .finally(() => clearTimeout(timeout))
}

export async function checkForUpdateNotice(options: StartOptions & {signal?: AbortSignal}): Promise<UpdateNotice | undefined> {
  const statePath = join(options.configDir, 'update-check.json')
  const now = options.now ?? new Date()
  const state = await readState(statePath)
  const lastCheckedAt = state.lastCheckedAt ? Date.parse(state.lastCheckedAt) : 0
  if (Number.isFinite(lastCheckedAt) && now.getTime() - lastCheckedAt < readIntervalMs(options.env)) return undefined

  await writeState(statePath, {lastCheckedAt: now.toISOString()})

  try {
    const layout = currentInstallLayout()
    const release = await fetchRelease('koda-software/opero-sdk', 'latest', {signal: options.signal})
    findReleaseAsset(release, layout.target)
    if (compareTags(release.tag_name, options.currentVersion) <= 0) return undefined

    return {
      currentVersion: options.currentVersion,
      latestVersion: release.tag_name,
      target: layout.target,
    }
  } catch {
    return undefined
  }
}

export function shouldCheckForUpdates(options: StartOptions): boolean {
  const env = options.env ?? process.env
  if (options.jsonEnabled) return false
  if (env.CI || env.OPERO_NO_UPDATE_CHECK || env.OPERO_SKIP_UPDATE_CHECK) return false
  if (options.stdinIsTTY === false || options.stdoutIsTTY === false || options.stderrIsTTY === false) return false
  if (isSourceCheckout()) return false

  const commandId = options.commandId ?? ''
  if (['autocomplete', 'help', 'update'].includes(commandId)) return false
  return true
}

function compareTags(left: string, right: string): number {
  const leftParts = parseTag(left)
  const rightParts = parseTag(right)
  for (const index of [0, 1, 2]) {
    const diff = leftParts[index] - rightParts[index]
    if (diff !== 0) return diff
  }

  return 0
}

function parseTag(value: string): [number, number, number] {
  const match = value.match(/^v?(\d+)\.(\d+)\.(\d+)/)
  if (!match) return [0, 0, 0]
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

async function readState(path: string): Promise<State> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as State
  } catch {
    return {}
  }
}

async function writeState(path: string, state: State): Promise<void> {
  await mkdir(dirname(path), {recursive: true})
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`)
}

function readIntervalMs(env: NodeJS.ProcessEnv | undefined): number {
  const value = Number(env?.OPERO_UPDATE_CHECK_INTERVAL_MS)
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_INTERVAL_MS
}

function readTimeoutMs(env: NodeJS.ProcessEnv | undefined): number {
  const value = Number(env?.OPERO_UPDATE_CHECK_TIMEOUT_MS)
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS
}
