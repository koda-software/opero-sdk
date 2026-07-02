import {spawnSync} from 'node:child_process'
import {stdin, stderr} from 'node:process'
import {createInterface} from 'node:readline/promises'
import type {Readable, Writable} from 'node:stream'

import pc from 'picocolors'

import type {UpdateNotice} from './background.js'

export type UpdatePromptChoice = 'skip' | 'update'

export type RunUpdateResult = {
  error?: string
  exitCode?: number
  status: 'failed' | 'updated'
}

export async function promptUpdateChoice(
  notice: UpdateNotice,
  options: {
    input?: Readable
    output?: Writable
  } = {},
): Promise<UpdatePromptChoice> {
  const input = options.input ?? stdin
  const output = options.output ?? stderr
  const rl = createInterface({input, output})

  try {
    output.write(
      `${pc.cyan('Update available')}: ${notice.latestVersion} ` +
        `${pc.dim(`(current ${notice.currentVersion}, ${notice.target})`)}\n`,
    )
    const answer = (await rl.question(`${pc.bold('Update now')} or ${pc.bold('Skip')}? [u/s]: `)).trim().toLowerCase()
    if (['1', 'u', 'update', 'update now', 'y', 'yes'].includes(answer)) return 'update'
    return 'skip'
  } finally {
    rl.close()
  }
}

export function runUpdateNow(options: {command?: string; cwd?: string} = {}): RunUpdateResult {
  const command = options.command ?? process.argv[1] ?? 'opero'
  const child = spawnSync(command, ['update'], {
    cwd: options.cwd,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  if (child.status === 0) return {status: 'updated'}

  return {
    error: child.error?.message,
    exitCode: child.status ?? undefined,
    status: 'failed',
  }
}

