#!/usr/bin/env node
import {cp, mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises'
import {basename, resolve} from 'node:path'
import {spawnSync} from 'node:child_process'

const repoRoot = resolve(import.meta.dirname, '..')
const cliRoot = resolve(repoRoot, 'packages/cli')
const packRoot = resolve(cliRoot, '.pack/opero')
const artifactDir = resolve(repoRoot, 'dist/standalone')
const targets = process.env.OPERO_PACK_TARGETS ?? 'linux-x64,darwin-x64,darwin-arm64,win32-x64'
const sha = process.env.OPERO_PACK_SHA ?? '0000000'

run('pnpm', ['--dir', cliRoot, 'build'], repoRoot)

await rm(packRoot, {force: true, recursive: true})
await mkdir(packRoot, {recursive: true})

const packageJson = JSON.parse(await readFile(resolve(cliRoot, 'package.json'), 'utf8'))
delete packageJson.devDependencies
packageJson.scripts = {}

await writeFile(resolve(packRoot, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`)
await cp(resolve(cliRoot, 'bin'), resolve(packRoot, 'bin'), {recursive: true})
await cp(resolve(cliRoot, 'dist'), resolve(packRoot, 'dist'), {recursive: true})

run('npm', ['install', '--omit=dev', '--ignore-scripts'], packRoot)
run('npm', ['shrinkwrap', '--ignore-scripts'], packRoot)
run('pnpm', ['--dir', cliRoot, 'exec', 'oclif', 'pack', 'tarballs', '--root', packRoot, '--targets', targets, '--sha', sha], repoRoot)

await rm(artifactDir, {force: true, recursive: true})
await mkdir(artifactDir, {recursive: true})
await copyArtifacts(resolve(packRoot, 'dist'), artifactDir)

console.log(`Standalone artifacts copied to ${artifactDir}`)

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

async function copyArtifacts(sourceDir, targetDir) {
  const entries = await readdir(sourceDir, {withFileTypes: true})
  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (!entry.name.endsWith('.tar.gz') && !entry.name.endsWith('.tar.xz')) continue
    await cp(resolve(sourceDir, entry.name), resolve(targetDir, basename(entry.name)))
  }
}
