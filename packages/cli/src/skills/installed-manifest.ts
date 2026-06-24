import {readFile, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

import type {SkillPlatform, SkillScope} from './platforms.js'

export const INSTALLED_SKILL_MANIFEST = '.opero-skill-install.json'

export type InstalledSkillManifest = {
  installedAt: string
  installedBy: 'opero'
  operoCliVersion: string
  platform: SkillPlatform
  schemaVersion: 1
  scope: SkillScope
  skill: string
  sourceHash: string
  sourcePath: string
}

export async function readInstalledSkillManifest(skillDir: string): Promise<InstalledSkillManifest | undefined> {
  try {
    const parsed = JSON.parse(await readFile(join(skillDir, INSTALLED_SKILL_MANIFEST), 'utf8')) as unknown
    if (!isInstalledSkillManifest(parsed)) return undefined
    return parsed
  } catch {
    return undefined
  }
}

export async function writeInstalledSkillManifest(skillDir: string, manifest: InstalledSkillManifest): Promise<void> {
  await writeFile(join(skillDir, INSTALLED_SKILL_MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`)
}

function isInstalledSkillManifest(value: unknown): value is InstalledSkillManifest {
  if (!value || typeof value !== 'object') return false

  return (
    'installedBy' in value &&
    value.installedBy === 'opero' &&
    'schemaVersion' in value &&
    value.schemaVersion === 1 &&
    'skill' in value &&
    typeof value.skill === 'string' &&
    'sourceHash' in value &&
    typeof value.sourceHash === 'string'
  )
}
