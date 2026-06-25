import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, describe, expect, it} from 'vitest'

import {installBundledSkills} from '../src/skills/install.js'
import {INSTALLED_SKILL_MANIFEST, type InstalledSkillManifest} from '../src/skills/installed-manifest.js'
import {resolveSkillTargetDir} from '../src/skills/platforms.js'

const version = '0.2.2-test'
let tempDirs: string[] = []

describe('skills install', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => rm(dir, {force: true, recursive: true})))
    tempDirs = []
  })

  it('dry-runs without writing files', async () => {
    const targetDir = await tempDir()

    const result = await installBundledSkills({
      dryRun: true,
      operoCliVersion: version,
      platform: 'codex',
      scope: 'user',
      targetDir,
    })

    expect(result.data.skills).toEqual([
      {
        action: 'would-install',
        name: 'opero-cli',
        targetPath: join(targetDir, 'opero-cli'),
      },
      {
        action: 'would-install',
        name: 'opero-dictionaries',
        targetPath: join(targetDir, 'opero-dictionaries'),
      },
      {
        action: 'would-install',
        name: 'opero-dynamic-modules',
        targetPath: join(targetDir, 'opero-dynamic-modules'),
      },
      {
        action: 'would-install',
        name: 'opero-dynamic-objects',
        targetPath: join(targetDir, 'opero-dynamic-objects'),
      },
      {
        action: 'would-install',
        name: 'opero-queries',
        targetPath: join(targetDir, 'opero-queries'),
      },
      {
        action: 'would-install',
        name: 'opero-scripts',
        targetPath: join(targetDir, 'opero-scripts'),
      },
      {
        action: 'would-install',
        name: 'opero-view-layouts',
        targetPath: join(targetDir, 'opero-view-layouts'),
      },
    ])
    await expect(readFile(join(targetDir, 'opero-cli', 'SKILL.md'), 'utf8')).rejects.toMatchObject({code: 'ENOENT'})
  })

  it('installs bundled skills and writes an Opero manifest', async () => {
    const targetDir = await tempDir()

    const result = await installBundledSkills({
      operoCliVersion: version,
      platform: 'claude',
      scope: 'user',
      targetDir,
    })

    expect(result.data.skills[0]).toMatchObject({
      action: 'installed',
      name: 'opero-cli',
      targetPath: join(targetDir, 'opero-cli'),
    })
    expect(result.data.skills[1]).toMatchObject({
      action: 'installed',
      name: 'opero-dictionaries',
      targetPath: join(targetDir, 'opero-dictionaries'),
    })
    expect(result.data.skills[2]).toMatchObject({
      action: 'installed',
      name: 'opero-dynamic-modules',
      targetPath: join(targetDir, 'opero-dynamic-modules'),
    })
    expect(result.data.skills[3]).toMatchObject({
      action: 'installed',
      name: 'opero-dynamic-objects',
      targetPath: join(targetDir, 'opero-dynamic-objects'),
    })
    expect(result.data.skills[4]).toMatchObject({
      action: 'installed',
      name: 'opero-queries',
      targetPath: join(targetDir, 'opero-queries'),
    })
    expect(result.data.skills[5]).toMatchObject({
      action: 'installed',
      name: 'opero-scripts',
      targetPath: join(targetDir, 'opero-scripts'),
    })
    expect(result.data.skills[6]).toMatchObject({
      action: 'installed',
      name: 'opero-view-layouts',
      targetPath: join(targetDir, 'opero-view-layouts'),
    })
    expect(await readFile(join(targetDir, 'opero-cli', 'SKILL.md'), 'utf8')).toContain('name: opero-cli')
    expect(await readFile(join(targetDir, 'opero-dictionaries', 'SKILL.md'), 'utf8')).toContain('name: opero-dictionaries')
    expect(await readFile(join(targetDir, 'opero-dynamic-modules', 'SKILL.md'), 'utf8')).toContain('name: opero-dynamic-modules')
    expect(await readFile(join(targetDir, 'opero-dynamic-objects', 'SKILL.md'), 'utf8')).toContain('name: opero-dynamic-objects')
    expect(await readFile(join(targetDir, 'opero-queries', 'SKILL.md'), 'utf8')).toContain('name: opero-queries')
    expect(await readFile(join(targetDir, 'opero-scripts', 'SKILL.md'), 'utf8')).toContain('name: opero-scripts')
    expect(await readFile(join(targetDir, 'opero-view-layouts', 'SKILL.md'), 'utf8')).toContain('name: opero-view-layouts')

    const manifest = JSON.parse(await readFile(join(targetDir, 'opero-cli', INSTALLED_SKILL_MANIFEST), 'utf8')) as InstalledSkillManifest
    expect(manifest).toMatchObject({
      installedBy: 'opero',
      operoCliVersion: version,
      platform: 'claude',
      schemaVersion: 1,
      scope: 'user',
      skill: 'opero-cli',
    })
    expect(manifest.sourceHash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('skips unchanged Opero-managed installs', async () => {
    const targetDir = await tempDir()
    await installBundledSkills({
      operoCliVersion: version,
      platform: 'codex',
      scope: 'user',
      targetDir,
    })

    const second = await installBundledSkills({
      operoCliVersion: version,
      platform: 'codex',
      scope: 'user',
      targetDir,
    })

    expect(second.data.skills[0]).toMatchObject({
      action: 'skipped',
      name: 'opero-cli',
    })
    expect(second.data.skills[1]).toMatchObject({
      action: 'skipped',
      name: 'opero-dictionaries',
    })
    expect(second.data.skills[2]).toMatchObject({
      action: 'skipped',
      name: 'opero-dynamic-modules',
    })
    expect(second.data.skills[3]).toMatchObject({
      action: 'skipped',
      name: 'opero-dynamic-objects',
    })
    expect(second.data.skills[4]).toMatchObject({
      action: 'skipped',
      name: 'opero-queries',
    })
    expect(second.data.skills[5]).toMatchObject({
      action: 'skipped',
      name: 'opero-scripts',
    })
    expect(second.data.skills[6]).toMatchObject({
      action: 'skipped',
      name: 'opero-view-layouts',
    })
  })

  it('updates Opero-managed installs when version changes', async () => {
    const targetDir = await tempDir()
    await installBundledSkills({
      operoCliVersion: version,
      platform: 'codex',
      scope: 'user',
      targetDir,
    })

    const second = await installBundledSkills({
      operoCliVersion: '0.2.3-test',
      platform: 'codex',
      scope: 'user',
      targetDir,
    })

    expect(second.data.skills[0]).toMatchObject({
      action: 'updated',
      name: 'opero-cli',
    })
    expect(second.data.skills[1]).toMatchObject({
      action: 'updated',
      name: 'opero-dictionaries',
    })
    expect(second.data.skills[2]).toMatchObject({
      action: 'updated',
      name: 'opero-dynamic-modules',
    })
    expect(second.data.skills[3]).toMatchObject({
      action: 'updated',
      name: 'opero-dynamic-objects',
    })
    expect(second.data.skills[4]).toMatchObject({
      action: 'updated',
      name: 'opero-queries',
    })
    expect(second.data.skills[5]).toMatchObject({
      action: 'updated',
      name: 'opero-scripts',
    })
    expect(second.data.skills[6]).toMatchObject({
      action: 'updated',
      name: 'opero-view-layouts',
    })
  })

  it('reports conflicts for unmanaged target folders', async () => {
    const targetDir = await tempDir()
    await mkdir(join(targetDir, 'opero-cli'))
    await writeFile(join(targetDir, 'opero-cli', 'custom.txt'), 'user skill')

    const result = await installBundledSkills({
      operoCliVersion: version,
      platform: 'codex',
      scope: 'user',
      targetDir,
    })

    expect(result.data.skills[0]).toMatchObject({
      action: 'conflict',
      name: 'opero-cli',
    })
    expect(await readFile(join(targetDir, 'opero-cli', 'custom.txt'), 'utf8')).toBe('user skill')
  })

  it('force-updates unmanaged target folders', async () => {
    const targetDir = await tempDir()
    await mkdir(join(targetDir, 'opero-cli'))
    await writeFile(join(targetDir, 'opero-cli', 'custom.txt'), 'user skill')

    const result = await installBundledSkills({
      force: true,
      operoCliVersion: version,
      platform: 'codex',
      scope: 'user',
      targetDir,
    })

    expect(result.data.skills[0]).toMatchObject({
      action: 'updated',
      name: 'opero-cli',
    })
    await expect(readFile(join(targetDir, 'opero-cli', 'custom.txt'), 'utf8')).rejects.toMatchObject({code: 'ENOENT'})
    expect(await readFile(join(targetDir, 'opero-cli', 'SKILL.md'), 'utf8')).toContain('name: opero-cli')
  })
})

describe('skill platform target resolution', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => rm(dir, {force: true, recursive: true})))
    tempDirs = []
  })

  it('resolves explicit target directories relative to cwd', async () => {
    const cwd = await tempDir()

    await expect(
      resolveSkillTargetDir({
        cwd,
        platform: 'codex',
        scope: 'repo',
        targetDir: 'skills-out',
      }),
    ).resolves.toBe(join(cwd, 'skills-out'))
  })

  it('resolves repo scope from git root', async () => {
    const repo = await tempDir()
    await mkdir(join(repo, '.git'))

    await expect(
      resolveSkillTargetDir({
        cwd: repo,
        platform: 'claude',
        scope: 'repo',
      }),
    ).resolves.toBe(join(repo, '.claude', 'skills'))
  })
})

async function tempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'opero-skills-'))
  tempDirs.push(dir)
  return dir
}
