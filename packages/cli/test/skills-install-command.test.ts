import {mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vitest'

import SkillsInstallClaude from '../src/commands/skills/install/claude.js'
import SkillsInstallCodex from '../src/commands/skills/install/codex.js'
import SkillsInstall from '../src/commands/skills/install.js'
import {SKILL_INSTALL_REGISTRY, type SkillInstallRegistry} from '../src/skills/registry.js'

let tempDirs: string[] = []

describe('skills install commands', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await Promise.all(tempDirs.map((dir) => rm(dir, {force: true, recursive: true})))
    tempDirs = []
  })

  it('installs Codex skills through the command wrapper', async () => {
    const targetDir = await tempDir()
    const configDir = await tempDir()
    const command = new SkillsInstallCodex([], {configDir, version: '0.2.2-test'} as never)
    command.parse = vi.fn().mockResolvedValue({
      args: {},
      flags: {
        'target-dir': targetDir,
        scope: 'user',
      },
    })
    command.jsonEnabled = vi.fn().mockReturnValue(true)
    command.printOutput = vi.fn()

    const result = (await command.run()) as {data: {platform: string; skills: Array<{action: string; name: string}>}}

    expect(result.data.platform).toBe('codex')
    expect(result.data.skills).toEqual([
      expect.objectContaining({
        action: 'installed',
        name: 'opero-cli',
      }),
      expect.objectContaining({
        action: 'installed',
        name: 'opero-dictionaries',
      }),
      expect.objectContaining({
        action: 'installed',
        name: 'opero-dynamic-modules',
      }),
      expect.objectContaining({
        action: 'installed',
        name: 'opero-dynamic-objects',
      }),
      expect.objectContaining({
        action: 'installed',
        name: 'opero-queries',
      }),
      expect.objectContaining({
        action: 'installed',
        name: 'opero-rules',
      }),
      expect.objectContaining({
        action: 'installed',
        name: 'opero-scripts',
      }),
      expect.objectContaining({
        action: 'installed',
        name: 'opero-view-layouts',
      }),
      expect.objectContaining({
        action: 'installed',
        name: 'opero-workflows',
      }),
    ])

    const registry = JSON.parse(await readFile(join(configDir, SKILL_INSTALL_REGISTRY), 'utf8')) as SkillInstallRegistry
    expect(registry.installs).toEqual([
      expect.objectContaining({
        platform: 'codex',
        scope: 'user',
        targetDir,
      }),
    ])
  })

  it('installs Claude skills through the command wrapper', async () => {
    const targetDir = await tempDir()
    const configDir = await tempDir()
    const command = new SkillsInstallClaude([], {configDir, version: '0.2.2-test'} as never)
    command.parse = vi.fn().mockResolvedValue({
      args: {},
      flags: {
        'dry-run': true,
        'target-dir': targetDir,
        scope: 'user',
      },
    })
    command.jsonEnabled = vi.fn().mockReturnValue(true)
    command.printOutput = vi.fn()

    const result = (await command.run()) as {data: {dryRun: boolean; platform: string; skills: Array<{action: string; name: string}>}}

    expect(result.data.dryRun).toBe(true)
    expect(result.data.platform).toBe('claude')
    expect(result.data.skills).toEqual([
      expect.objectContaining({
        action: 'would-install',
        name: 'opero-cli',
      }),
      expect.objectContaining({
        action: 'would-install',
        name: 'opero-dictionaries',
      }),
      expect.objectContaining({
        action: 'would-install',
        name: 'opero-dynamic-modules',
      }),
      expect.objectContaining({
        action: 'would-install',
        name: 'opero-dynamic-objects',
      }),
      expect.objectContaining({
        action: 'would-install',
        name: 'opero-queries',
      }),
      expect.objectContaining({
        action: 'would-install',
        name: 'opero-rules',
      }),
      expect.objectContaining({
        action: 'would-install',
        name: 'opero-scripts',
      }),
      expect.objectContaining({
        action: 'would-install',
        name: 'opero-view-layouts',
      }),
      expect.objectContaining({
        action: 'would-install',
        name: 'opero-workflows',
      }),
    ])
  })

  it('prints concise target choices for the parent install command', async () => {
    const command = new SkillsInstall([], {} as never)
    command.parse = vi.fn().mockResolvedValue({args: {}, flags: {}})
    command.log = vi.fn()

    await command.run()

    const output = command.log.mock.calls.map((call) => String(call[0])).join('\n')
    expect(output).toContain('opero skills install codex')
    expect(output).toContain('opero skills install claude')
    expect(output).toContain('--scope user|repo')
  })

  it('prints human install feedback instead of generic object output', async () => {
    const targetDir = await tempDir()
    const configDir = await tempDir()
    const command = new SkillsInstallCodex([], {configDir, version: '0.2.2-test'} as never)
    command.parse = vi.fn().mockResolvedValue({
      args: {},
      flags: {
        'target-dir': targetDir,
        scope: 'user',
      },
    })
    command.jsonEnabled = vi.fn().mockReturnValue(false)
    command.log = vi.fn()

    await command.run()

    const output = command.log.mock.calls.map((call) => String(call[0])).join('\n')
    expect(stripAnsi(output)).toContain('Installed 9 Opero skills for Codex')
    expect(stripAnsi(output)).toContain('opero-cli installed to')
    expect(stripAnsi(output)).toContain('opero-dictionaries installed to')
    expect(stripAnsi(output)).toContain('opero-dynamic-modules installed to')
    expect(stripAnsi(output)).toContain('opero-dynamic-objects installed to')
    expect(stripAnsi(output)).toContain('opero-queries installed to')
    expect(stripAnsi(output)).toContain('opero-rules installed to')
    expect(stripAnsi(output)).toContain('opero-scripts installed to')
    expect(stripAnsi(output)).toContain('opero-view-layouts installed to')
    expect(stripAnsi(output)).toContain('opero-workflows installed to')
    expect(output).not.toContain('dryRun')
  })
})

async function tempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'opero-skills-command-'))
  tempDirs.push(dir)
  return dir
}

function stripAnsi(value: string): string {
  return value.replaceAll(/\u001B\[[0-?]*[ -/]*[@-~]/g, '')
}
