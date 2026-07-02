import {chmod, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, describe, expect, it} from 'vitest'

import {installBundledSkills} from '../src/skills/install.js'
import {
  findManagedSkillInstallTargets,
  recordSkillInstall,
  reinstallManagedSkillInstalls,
  SKILL_INSTALL_REGISTRY,
  type SkillInstallRegistry,
} from '../src/skills/registry.js'

const version = '0.2.2-test'
let tempDirs: string[] = []

describe('skill install registry', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => rm(dir, {force: true, recursive: true})))
    tempDirs = []
  })

  it('records explicit skill install targets for later updates', async () => {
    const configDir = await tempDir()
    const targetDir = await tempDir()
    const install = await installBundledSkills({
      operoCliVersion: version,
      platform: 'claude',
      scope: 'user',
      targetDir,
    })

    await recordSkillInstall(configDir, install.data)

    const registry = JSON.parse(await readFile(join(configDir, SKILL_INSTALL_REGISTRY), 'utf8')) as SkillInstallRegistry
    expect(registry).toMatchObject({schemaVersion: 1})
    expect(registry.installs).toEqual([
      expect.objectContaining({
        platform: 'claude',
        scope: 'user',
        targetDir,
      }),
    ])
  })

  it('discovers managed targets from default manifests even without registry entries', async () => {
    const repo = await gitRepo()
    await installBundledSkills({
      cwd: repo,
      operoCliVersion: version,
      platform: 'codex',
      scope: 'repo',
    })

    const targets = await findManagedSkillInstallTargets({
      configDir: await tempDir(),
      cwd: repo,
    })

    expect(targets).toContainEqual({
      platform: 'codex',
      scope: 'repo',
      targetDir: join(repo, '.agents', 'skills'),
    })
  })

  it('refreshes remembered targets through the newly installed executable', async () => {
    const configDir = await tempDir()
    const targetDir = await tempDir()
    const install = await installBundledSkills({
      operoCliVersion: version,
      platform: 'codex',
      scope: 'user',
      targetDir,
    })
    await recordSkillInstall(configDir, install.data)

    const executable = join(await tempDir(), 'opero')
    const callsPath = join(await tempDir(), 'calls.txt')
    await writeFile(
      executable,
      `#!/usr/bin/env sh\nprintf '%s\\n' "$*" >> "${callsPath}"\nexit 0\n`,
      'utf8',
    )
    await chmod(executable, 0o755)

    const result = await reinstallManagedSkillInstalls({
      configDir,
      executable,
    })

    expect(result).toContainEqual({
      platform: 'codex',
      scope: 'user',
      status: 'refreshed',
      targetDir,
    })
    expect(await readFile(callsPath, 'utf8')).toContain(`skills install codex --scope user --target-dir ${targetDir} --json\n`)
  })
})

async function gitRepo(): Promise<string> {
  const dir = await tempDir()
  await mkdir(join(dir, '.git'))
  return dir
}

async function tempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'opero-skills-registry-'))
  tempDirs.push(dir)
  return dir
}
