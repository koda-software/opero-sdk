import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vitest'

import SkillsInstallClaude from '../src/commands/skills/install/claude.js'
import SkillsInstallCodex from '../src/commands/skills/install/codex.js'
import SkillsInstall from '../src/commands/skills/install.js'

let tempDirs: string[] = []

describe('skills install commands', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await Promise.all(tempDirs.map((dir) => rm(dir, {force: true, recursive: true})))
    tempDirs = []
  })

  it('installs Codex skills through the command wrapper', async () => {
    const targetDir = await tempDir()
    const command = new SkillsInstallCodex([], {version: '0.2.2-test'} as never)
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
    ])
  })

  it('installs Claude skills through the command wrapper', async () => {
    const targetDir = await tempDir()
    const command = new SkillsInstallClaude([], {version: '0.2.2-test'} as never)
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
    const command = new SkillsInstallCodex([], {version: '0.2.2-test'} as never)
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
    expect(stripAnsi(output)).toContain('Installed 1 Opero skill for Codex')
    expect(stripAnsi(output)).toContain('opero-cli installed to')
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
