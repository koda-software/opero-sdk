import {createHash} from 'node:crypto'
import {cp, mkdir, readdir, readFile, rm, stat} from 'node:fs/promises'
import {join, relative} from 'node:path'

import {OperoCliError} from '../api/errors.js'
import {listAvailableSkills, type AvailableSkill} from './source.js'
import {readInstalledSkillManifest, writeInstalledSkillManifest, type InstalledSkillManifest} from './installed-manifest.js'
import {resolveSkillTargetDir, type SkillPlatform, type SkillScope} from './platforms.js'

export type InstallSkillAction = 'conflict' | 'installed' | 'skipped' | 'updated' | 'would-install' | 'would-update'

export type InstallSkillsOptions = {
  cwd?: string
  dryRun?: boolean
  force?: boolean
  operoCliVersion: string
  platform: SkillPlatform
  scope: SkillScope
  targetDir?: string
}

export type InstalledSkillResult = {
  action: InstallSkillAction
  name: string
  targetPath: string
}

export type InstallSkillsResult = {
  data: {
    dryRun: boolean
    platform: SkillPlatform
    scope: SkillScope
    skills: InstalledSkillResult[]
    targetDir: string
  }
}

export async function installBundledSkills(options: InstallSkillsOptions): Promise<InstallSkillsResult> {
  const targetDir = await resolveSkillTargetDir(options)
  const skills = await listAvailableSkills()
  const results: InstalledSkillResult[] = []

  for (const skill of skills) {
    results.push(await installSkill(skill, targetDir, options))
  }

  return {
    data: {
      dryRun: Boolean(options.dryRun),
      platform: options.platform,
      scope: options.scope,
      skills: results,
      targetDir,
    },
  }
}

async function installSkill(skill: AvailableSkill, targetDir: string, options: InstallSkillsOptions): Promise<InstalledSkillResult> {
  const targetPath = join(targetDir, skill.name)
  const sourceHash = await hashDirectory(skill.path)
  const existing = await getExistingTarget(targetPath)
  const manifest = existing ? await readInstalledSkillManifest(targetPath) : undefined
  const desiredManifest: InstalledSkillManifest = {
    installedAt: new Date().toISOString(),
    installedBy: 'opero',
    operoCliVersion: options.operoCliVersion,
    platform: options.platform,
    schemaVersion: 1,
    scope: options.scope,
    skill: skill.name,
    sourceHash,
    sourcePath: skill.path,
  }

  if (existing && !manifest && !options.force) {
    return {action: 'conflict', name: skill.name, targetPath}
  }

  const action = getInstallAction({
    dryRun: Boolean(options.dryRun),
    existing,
    manifest,
    operoCliVersion: options.operoCliVersion,
    sourceHash,
  })

  if (action === 'conflict') return {action, name: skill.name, targetPath}
  if (action === 'skipped' || action === 'would-install' || action === 'would-update') {
    return {action, name: skill.name, targetPath}
  }

  await mkdir(targetDir, {recursive: true})
  if (existing) await rm(targetPath, {force: true, recursive: true})
  await cp(skill.path, targetPath, {recursive: true})
  await writeInstalledSkillManifest(targetPath, desiredManifest)

  return {action, name: skill.name, targetPath}
}

function getInstallAction(args: {
  dryRun: boolean
  existing: boolean
  manifest?: InstalledSkillManifest
  operoCliVersion: string
  sourceHash: string
}): InstallSkillAction {
  if (!args.existing) return args.dryRun ? 'would-install' : 'installed'
  if (!args.manifest) return args.dryRun ? 'would-update' : 'updated'

  const unchanged = args.manifest.sourceHash === args.sourceHash && args.manifest.operoCliVersion === args.operoCliVersion
  if (unchanged) return 'skipped'
  return args.dryRun ? 'would-update' : 'updated'
}

async function getExistingTarget(path: string): Promise<boolean> {
  try {
    const info = await stat(path)
    if (!info.isDirectory()) {
      throw new OperoCliError({
        code: 'FILE_ERROR',
        exitCode: 7,
        message: `Skill target exists but is not a directory: ${path}`,
      })
    }

    return true
  } catch (error) {
    if (error instanceof OperoCliError) throw error
    if (isMissingFile(error)) return false
    throw error
  }
}

export async function hashDirectory(root: string): Promise<string> {
  const hash = createHash('sha256')
  const files = await listFiles(root)
  for (const file of files) {
    hash.update(relative(root, file))
    hash.update('\0')
    hash.update(await readFile(file))
    hash.update('\0')
  }

  return hash.digest('hex')
}

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, {withFileTypes: true})
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(root, entry.name)
      if (entry.isDirectory()) return listFiles(path)
      if (entry.isFile()) return [path]
      return []
    }),
  )

  return files.flat().sort()
}

function isMissingFile(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
}
