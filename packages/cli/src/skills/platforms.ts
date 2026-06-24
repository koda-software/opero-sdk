import {stat} from 'node:fs/promises'
import {homedir} from 'node:os'
import {dirname, join, resolve} from 'node:path'

import {OperoCliError} from '../api/errors.js'

export type SkillPlatform = 'claude' | 'codex'
export type SkillScope = 'repo' | 'user'

export type ResolveSkillTargetDirOptions = {
  cwd?: string
  platform: SkillPlatform
  scope: SkillScope
  targetDir?: string
}

export async function resolveSkillTargetDir(options: ResolveSkillTargetDirOptions): Promise<string> {
  if (options.targetDir) return resolve(options.cwd ?? process.cwd(), options.targetDir)

  if (options.scope === 'user') {
    return options.platform === 'codex' ? join(homedir(), '.agents', 'skills') : join(homedir(), '.claude', 'skills')
  }

  const repoRoot = await findGitRoot(options.cwd ?? process.cwd())
  if (!repoRoot) {
    throw new OperoCliError({
      code: 'USAGE_ERROR',
      exitCode: 2,
      message: 'Could not find a Git repository root for --scope repo. Use --target-dir to choose an explicit install directory.',
    })
  }

  return options.platform === 'codex' ? join(repoRoot, '.agents', 'skills') : join(repoRoot, '.claude', 'skills')
}

async function findGitRoot(start: string): Promise<string | undefined> {
  let current = resolve(start)
  while (true) {
    if (await exists(join(current, '.git'))) return current
    const parent = dirname(current)
    if (parent === current) return undefined
    current = parent
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}
