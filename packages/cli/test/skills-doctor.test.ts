import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vitest'

import SkillsDoctor from '../src/commands/skills/doctor.js'
import {checkSkills} from '../src/skills/doctor.js'
import {installBundledSkills} from '../src/skills/install.js'

const version = '0.2.2-test'
let tempDirs: string[] = []

describe('skills doctor', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await Promise.all(tempDirs.map((dir) => rm(dir, {force: true, recursive: true})))
    tempDirs = []
  })

  it('reports missing skills', async () => {
    const repo = await gitRepo()

    const result = await checkSkills({
      cwd: repo,
      operoCliVersion: version,
      scopes: ['repo'],
    })

    expect(result.data.bundled).toEqual([
      expect.objectContaining({name: 'opero-cli'}),
      expect.objectContaining({name: 'opero-queries'}),
      expect.objectContaining({name: 'opero-scripts'}),
    ])
    expect(result.data.targets).toEqual([
      expect.objectContaining({
        platform: 'codex',
        scope: 'repo',
        skills: [
          expect.objectContaining({
            command: 'opero skills install codex --scope repo',
            name: 'opero-cli',
            status: 'missing',
          }),
          expect.objectContaining({
            command: 'opero skills install codex --scope repo',
            name: 'opero-queries',
            status: 'missing',
          }),
          expect.objectContaining({
            command: 'opero skills install codex --scope repo',
            name: 'opero-scripts',
            status: 'missing',
          }),
        ],
      }),
      expect.objectContaining({
        platform: 'claude',
        scope: 'repo',
        skills: [
          expect.objectContaining({
            command: 'opero skills install claude --scope repo',
            name: 'opero-cli',
            status: 'missing',
          }),
          expect.objectContaining({
            command: 'opero skills install claude --scope repo',
            name: 'opero-queries',
            status: 'missing',
          }),
          expect.objectContaining({
            command: 'opero skills install claude --scope repo',
            name: 'opero-scripts',
            status: 'missing',
          }),
        ],
      }),
    ])
  })

  it('reports current and outdated Opero-managed installs', async () => {
    const repo = await gitRepo()
    await installBundledSkills({
      cwd: repo,
      operoCliVersion: version,
      platform: 'codex',
      scope: 'repo',
    })
    await installBundledSkills({
      cwd: repo,
      operoCliVersion: '0.2.1-test',
      platform: 'claude',
      scope: 'repo',
    })

    const result = await checkSkills({
      cwd: repo,
      operoCliVersion: version,
      scopes: ['repo'],
    })

    expect(result.data.targets[0].skills[0]).toMatchObject({
      installedVersion: version,
      name: 'opero-cli',
      status: 'current',
    })
    expect(result.data.targets[0].skills[1]).toMatchObject({
      installedVersion: version,
      name: 'opero-queries',
      status: 'current',
    })
    expect(result.data.targets[0].skills[2]).toMatchObject({
      installedVersion: version,
      name: 'opero-scripts',
      status: 'current',
    })
    expect(result.data.targets[1].skills[0]).toMatchObject({
      installedVersion: '0.2.1-test',
      name: 'opero-cli',
      status: 'outdated',
    })
    expect(result.data.targets[1].skills[1]).toMatchObject({
      installedVersion: '0.2.1-test',
      name: 'opero-queries',
      status: 'outdated',
    })
    expect(result.data.targets[1].skills[2]).toMatchObject({
      installedVersion: '0.2.1-test',
      name: 'opero-scripts',
      status: 'outdated',
    })
  })

  it('reports unmanaged folders as conflicts', async () => {
    const repo = await gitRepo()
    await mkdir(join(repo, '.agents', 'skills', 'opero-cli'), {recursive: true})
    await writeFile(join(repo, '.agents', 'skills', 'opero-cli', 'custom.txt'), 'user skill')

    const result = await checkSkills({
      cwd: repo,
      operoCliVersion: version,
      scopes: ['repo'],
    })

    expect(result.data.targets[0].skills[0]).toMatchObject({
      command: 'opero skills install codex --scope repo --force',
      name: 'opero-cli',
      status: 'conflict',
    })
    expect(await readFile(join(repo, '.agents', 'skills', 'opero-cli', 'custom.txt'), 'utf8')).toBe('user skill')
  })

  it('prints human doctor output', async () => {
    const command = new SkillsDoctor([], {version} as never)
    command.parse = vi.fn().mockResolvedValue({args: {}, flags: {}})
    command.jsonEnabled = vi.fn().mockReturnValue(false)
    command.log = vi.fn()

    await command.run()

    const output = stripAnsi(command.log.mock.calls.map((call) => String(call[0])).join('\n'))
    expect(output).toContain('Opero agent skills')
    expect(output).toContain('Bundled')
    expect(output).toContain('opero-cli')
    expect(output).toContain('opero-queries')
    expect(output).toContain('opero-scripts')
    expect(output).toContain('Codex user')
    expect(output).toContain('Claude user')
  })
})

async function gitRepo(): Promise<string> {
  const dir = await tempDir()
  await mkdir(join(dir, '.git'))
  return dir
}

async function tempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'opero-skills-doctor-'))
  tempDirs.push(dir)
  return dir
}

function stripAnsi(value: string): string {
  return value.replaceAll(/\u001B\[[0-?]*[ -/]*[@-~]/g, '')
}
