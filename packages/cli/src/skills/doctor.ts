import {stat} from 'node:fs/promises'
import {join} from 'node:path'

import {hashDirectory} from './install.js'
import {readInstalledSkillManifest, type InstalledSkillManifest} from './installed-manifest.js'
import {resolveSkillTargetDir, type SkillPlatform, type SkillScope} from './platforms.js'
import {listAvailableSkills, type AvailableSkill} from './source.js'

export type SkillInstallStatus = 'conflict' | 'current' | 'missing' | 'outdated'

export type SkillDoctorOptions = {
  cwd?: string
  operoCliVersion: string
  scopes?: SkillScope[]
}

export type SkillDoctorSkill = {
  command: string
  installedVersion?: string
  name: string
  status: SkillInstallStatus
  targetPath: string
}

export type SkillDoctorTarget = {
  platform: SkillPlatform
  scope: SkillScope
  skills: SkillDoctorSkill[]
  targetDir: string
}

export type SkillDoctorResult = {
  data: {
    bundled: Array<{description: string; name: string; path: string}>
    targets: SkillDoctorTarget[]
  }
}

export async function checkSkills(options: SkillDoctorOptions): Promise<SkillDoctorResult> {
  const skills = await listAvailableSkills()
  const sourceHashes = new Map<string, string>()
  for (const skill of skills) {
    sourceHashes.set(skill.name, await hashDirectory(skill.path))
  }

  const targets: SkillDoctorTarget[] = []
  for (const platform of ['codex', 'claude'] satisfies SkillPlatform[]) {
    for (const scope of options.scopes ?? (['user'] satisfies SkillScope[])) {
      targets.push(await checkTarget({platform, scope, skills, sourceHashes, ...options}))
    }
  }

  return {
    data: {
      bundled: skills.map((skill) => ({
        description: skill.description,
        name: skill.name,
        path: skill.path,
      })),
      targets,
    },
  }
}

async function checkTarget(args: {
  cwd?: string
  operoCliVersion: string
  platform: SkillPlatform
  scope: SkillScope
  skills: AvailableSkill[]
  sourceHashes: Map<string, string>
}): Promise<SkillDoctorTarget> {
  const targetDir = await resolveSkillTargetDir({
    cwd: args.cwd,
    platform: args.platform,
    scope: args.scope,
  })

  return {
    platform: args.platform,
    scope: args.scope,
    skills: await Promise.all(
      args.skills.map(async (skill) => checkSkill({skill, targetDir, ...args, sourceHash: args.sourceHashes.get(skill.name) ?? ''})),
    ),
    targetDir,
  }
}

async function checkSkill(args: {
  operoCliVersion: string
  platform: SkillPlatform
  scope: SkillScope
  skill: AvailableSkill
  sourceHash: string
  targetDir: string
}): Promise<SkillDoctorSkill> {
  const targetPath = join(args.targetDir, args.skill.name)
  const command = `opero skills install ${args.platform}${args.scope === 'repo' ? ' --scope repo' : ''}`
  const exists = await targetExists(targetPath)
  if (!exists) {
    return {
      command,
      name: args.skill.name,
      status: 'missing',
      targetPath,
    }
  }

  const manifest = await readInstalledSkillManifest(targetPath)
  if (!manifest) {
    return {
      command: `${command} --force`,
      name: args.skill.name,
      status: 'conflict',
      targetPath,
    }
  }

  return {
    command,
    installedVersion: manifest.operoCliVersion,
    name: args.skill.name,
    status: isCurrent(manifest, args) ? 'current' : 'outdated',
    targetPath,
  }
}

function isCurrent(
  manifest: InstalledSkillManifest,
  args: {operoCliVersion: string; platform: SkillPlatform; scope: SkillScope; skill: AvailableSkill; sourceHash: string},
): boolean {
  return (
    manifest.skill === args.skill.name &&
    manifest.platform === args.platform &&
    manifest.scope === args.scope &&
    manifest.operoCliVersion === args.operoCliVersion &&
    manifest.sourceHash === args.sourceHash
  )
}

async function targetExists(path: string): Promise<boolean> {
  try {
    const info = await stat(path)
    return info.isDirectory()
  } catch {
    return false
  }
}
