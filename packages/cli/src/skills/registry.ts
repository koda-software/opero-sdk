import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises'
import {spawnSync} from 'node:child_process'
import {join, resolve} from 'node:path'

import type {InstallSkillsResult} from './install.js'
import {readInstalledSkillManifest} from './installed-manifest.js'
import {resolveSkillTargetDir, type SkillPlatform, type SkillScope} from './platforms.js'

export const SKILL_INSTALL_REGISTRY = 'skill-installs.json'

export type RegisteredSkillInstall = {
  installedAt: string
  platform: SkillPlatform
  scope: SkillScope
  targetDir: string
  updatedAt: string
}

export type SkillInstallRegistry = {
  installs: RegisteredSkillInstall[]
  schemaVersion: 1
}

export type SkillInstallTarget = {
  platform: SkillPlatform
  scope: SkillScope
  targetDir: string
}

export type ReinstallSkillInstallResult = SkillInstallTarget & {
  error?: string
  exitCode?: number
  status: 'failed' | 'refreshed'
}

export async function recordSkillInstall(configDir: string, install: InstallSkillsResult['data']): Promise<void> {
  if (install.dryRun) return
  if (!install.skills.some((skill) => skill.action !== 'conflict')) return

  const now = new Date().toISOString()
  const target: SkillInstallTarget = {
    platform: install.platform,
    scope: install.scope,
    targetDir: resolve(install.targetDir),
  }
  const registry = await readSkillInstallRegistry(configDir)
  const existing = registry.installs.find((item) => targetKey(item) === targetKey(target))
  if (existing) {
    existing.updatedAt = now
  } else {
    registry.installs.push({
      ...target,
      installedAt: now,
      updatedAt: now,
    })
  }

  registry.installs.sort((a, b) => targetKey(a).localeCompare(targetKey(b)))
  await mkdir(configDir, {recursive: true})
  await writeFile(registryPath(configDir), `${JSON.stringify(registry, null, 2)}\n`, {mode: 0o600})
}

export async function readSkillInstallRegistry(configDir: string): Promise<SkillInstallRegistry> {
  try {
    const parsed = JSON.parse(await readFile(registryPath(configDir), 'utf8')) as unknown
    if (!isSkillInstallRegistry(parsed)) return emptyRegistry()
    return parsed
  } catch {
    return emptyRegistry()
  }
}

export async function findManagedSkillInstallTargets(options: {configDir: string; cwd?: string}): Promise<SkillInstallTarget[]> {
  const found = new Map<string, SkillInstallTarget>()
  const registry = await readSkillInstallRegistry(options.configDir)
  for (const install of registry.installs) {
    if (await hasManagedInstall(install)) found.set(targetKey(install), toTarget(install))
  }

  for (const platform of ['codex', 'claude'] satisfies SkillPlatform[]) {
    for (const scope of ['user', 'repo'] satisfies SkillScope[]) {
      const targetDir = await resolveKnownTargetDir({cwd: options.cwd, platform, scope})
      if (!targetDir) continue
      const target = {platform, scope, targetDir}
      if (await hasManagedInstall(target)) found.set(targetKey(target), target)
    }
  }

  return [...found.values()].sort((a, b) => targetKey(a).localeCompare(targetKey(b)))
}

export async function reinstallManagedSkillInstalls(options: {
  configDir: string
  cwd?: string
  executable: string
  onProgress?: (message: string) => void
}): Promise<ReinstallSkillInstallResult[]> {
  const targets = await findManagedSkillInstallTargets({configDir: options.configDir, cwd: options.cwd})
  const results: ReinstallSkillInstallResult[] = []

  for (const target of targets) {
    options.onProgress?.(`Refreshing ${formatSkillInstallTarget(target)} skills`)
    const child = spawnSync(
      options.executable,
      ['skills', 'install', target.platform, '--scope', target.scope, '--target-dir', target.targetDir, '--json'],
      {
        cwd: options.cwd,
        encoding: 'utf8',
        shell: process.platform === 'win32',
      },
    )

    if (child.status === 0) {
      results.push({...target, status: 'refreshed'})
    } else {
      results.push({
        ...target,
        error: child.stderr.trim() || child.stdout.trim() || child.error?.message || 'Skill reinstall failed',
        exitCode: child.status ?? undefined,
        status: 'failed',
      })
    }
  }

  return results
}

export function formatSkillInstallTarget(target: SkillInstallTarget): string {
  const platform = target.platform === 'codex' ? 'Codex' : 'Claude'
  return `${platform} ${target.scope}`
}

async function resolveKnownTargetDir(options: {cwd?: string; platform: SkillPlatform; scope: SkillScope}): Promise<string | undefined> {
  try {
    return await resolveSkillTargetDir(options)
  } catch {
    return undefined
  }
}

async function hasManagedInstall(target: SkillInstallTarget): Promise<boolean> {
  let entries
  try {
    entries = await readdir(target.targetDir, {withFileTypes: true})
  } catch {
    return false
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const manifest = await readInstalledSkillManifest(join(target.targetDir, entry.name))
    if (manifest?.platform === target.platform && manifest.scope === target.scope) return true
  }

  return false
}

function registryPath(configDir: string): string {
  return join(configDir, SKILL_INSTALL_REGISTRY)
}

function emptyRegistry(): SkillInstallRegistry {
  return {
    installs: [],
    schemaVersion: 1,
  }
}

function toTarget(install: RegisteredSkillInstall): SkillInstallTarget {
  return {
    platform: install.platform,
    scope: install.scope,
    targetDir: install.targetDir,
  }
}

function targetKey(target: SkillInstallTarget): string {
  return `${target.platform}:${target.scope}:${resolve(target.targetDir)}`
}

function isSkillInstallRegistry(value: unknown): value is SkillInstallRegistry {
  if (!value || typeof value !== 'object') return false
  if (!('schemaVersion' in value) || value.schemaVersion !== 1) return false
  if (!('installs' in value) || !Array.isArray(value.installs)) return false
  return value.installs.every(isRegisteredSkillInstall)
}

function isRegisteredSkillInstall(value: unknown): value is RegisteredSkillInstall {
  if (!value || typeof value !== 'object') return false

  return (
    'platform' in value &&
    (value.platform === 'codex' || value.platform === 'claude') &&
    'scope' in value &&
    (value.scope === 'user' || value.scope === 'repo') &&
    'targetDir' in value &&
    typeof value.targetDir === 'string' &&
    'installedAt' in value &&
    typeof value.installedAt === 'string' &&
    'updatedAt' in value &&
    typeof value.updatedAt === 'string'
  )
}
