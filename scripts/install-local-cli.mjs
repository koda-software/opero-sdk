#!/usr/bin/env node
import {chmod, mkdir, symlink, unlink} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'

const repoRoot = resolve(import.meta.dirname, '..')
const source = resolve(repoRoot, 'packages/cli/bin/run.js')
const target = resolve(process.env.HOME ?? '', '.local/bin/opero')

if (!process.env.HOME) {
  console.error('HOME is not set; cannot install opero into ~/.local/bin')
  process.exit(1)
}

await mkdir(dirname(target), {recursive: true})
await chmod(source, 0o755)

try {
  await unlink(target)
} catch (error) {
  if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'ENOENT') {
    throw error
  }
}

await symlink(source, target)
console.log(`Installed opero -> ${source}`)
console.log(`Target: ${target}`)
