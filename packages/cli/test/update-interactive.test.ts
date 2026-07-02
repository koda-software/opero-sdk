import {chmod, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {PassThrough, Readable} from 'node:stream'
import {afterEach, describe, expect, it} from 'vitest'

import {promptUpdateChoice, runUpdateNow} from '../src/update/interactive.js'

let tempDirs: string[] = []

describe('interactive updates', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => rm(dir, {force: true, recursive: true})))
    tempDirs = []
  })

  it('maps update prompt answers to update or skip', async () => {
    const updateChoice = await promptUpdateChoice(notice(), {
      input: Readable.from(['u\n']),
      output: new PassThrough(),
    })
    const skipChoice = await promptUpdateChoice(notice(), {
      input: Readable.from(['s\n']),
      output: new PassThrough(),
    })
    const defaultChoice = await promptUpdateChoice(notice(), {
      input: Readable.from(['\n']),
      output: new PassThrough(),
    })

    expect(updateChoice).toBe('update')
    expect(skipChoice).toBe('skip')
    expect(defaultChoice).toBe('skip')
  })

  it('runs the update command through the current executable', async () => {
    const dir = await tempDir()
    const executable = join(dir, 'opero')
    const callsPath = join(dir, 'calls.txt')
    await writeFile(executable, `#!/usr/bin/env sh\nprintf '%s\\n' "$*" > "${callsPath}"\n`, 'utf8')
    await chmod(executable, 0o755)

    const result = runUpdateNow({command: executable})

    expect(result).toEqual({status: 'updated'})
    expect(await readFile(callsPath, 'utf8')).toBe('update\n')
  })

  it('reports failed update commands without throwing', async () => {
    const result = runUpdateNow({command: join(await tempDir(), 'missing-opero')})

    expect(result.status).toBe('failed')
    expect(result.error || result.exitCode).toBeTruthy()
  })
})

function notice() {
  return {
    currentVersion: 'v0.2.2',
    latestVersion: 'v0.2.3',
    target: 'linux-x64',
  }
}

async function tempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'opero-update-interactive-'))
  tempDirs.push(dir)
  return dir
}

