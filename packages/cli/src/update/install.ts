import {createHash} from 'node:crypto'
import {chmod, mkdir, readFile, rm, symlink, unlink, writeFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'
import {spawnSync} from 'node:child_process'
import {platform} from 'node:process'

import {OperoCliError} from '../api/errors.js'
import type {ReleaseAsset} from './github.js'
import type {InstallLayout} from './platform.js'

export type InstallUpdateOptions = {
  asset: ReleaseAsset
  binDir: string
  checksums: ReleaseAsset
  installDir: string
  layout: InstallLayout
  tag: string
}

export type InstallUpdateResult = {
  executable: string
  installPath: string
}

export async function installUpdate(options: InstallUpdateOptions): Promise<InstallUpdateResult> {
  const tmpDir = resolve(options.installDir, '.tmp', `${options.tag}-${Date.now()}`)
  const archivePath = resolve(tmpDir, options.asset.name)
  const checksumsPath = resolve(tmpDir, 'checksums.txt')

  await rm(tmpDir, {force: true, recursive: true})
  await mkdir(tmpDir, {recursive: true})

  try {
    await downloadFile(options.asset.browser_download_url, archivePath)
    await downloadFile(options.checksums.browser_download_url, checksumsPath)
    await verifyChecksum(archivePath, checksumsPath, options.asset.name)

    const versionDir = resolve(options.installDir, options.tag)
    await rm(versionDir, {force: true, recursive: true})
    await mkdir(versionDir, {recursive: true})

    const tar = spawnSync('tar', ['-xzf', archivePath, '-C', versionDir], {stdio: 'inherit'})
    if (tar.status !== 0) {
      throw new OperoCliError({
        code: 'UPDATE_EXTRACT_FAILED',
        exitCode: 7,
        message: 'Could not extract update archive',
      })
    }

    const executable = resolve(versionDir, options.layout.executableRelativePath)
    const linkPath = resolve(options.binDir, platform === 'win32' ? 'opero.cmd' : 'opero')
    await mkdir(dirname(linkPath), {recursive: true})

    if (platform === 'win32') {
      await writeFile(linkPath, `@echo off\r\ncall "${executable}" %*\r\n`, 'ascii')
    } else {
      await chmod(executable, 0o755)
      await unlink(linkPath).catch((error: unknown) => {
        if (!isMissingFile(error)) throw error
      })

      await symlink(executable, linkPath)
    }

    return {executable: linkPath, installPath: versionDir}
  } finally {
    await rm(tmpDir, {force: true, recursive: true})
  }
}

async function downloadFile(url: string, path: string): Promise<void> {
  const response = await fetch(url, {headers: {'user-agent': 'opero-cli-updater'}})
  if (!response.ok) {
    throw new OperoCliError({
      code: 'UPDATE_DOWNLOAD_FAILED',
      exitCode: 6,
      message: `Could not download ${url}: HTTP ${response.status}`,
      status: response.status,
    })
  }

  const bytes = Buffer.from(await response.arrayBuffer())
  await writeFile(path, bytes)
}

async function verifyChecksum(archivePath: string, checksumsPath: string, assetName: string): Promise<void> {
  const checksums = await readFile(checksumsPath, 'utf8')
  const line = checksums
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.endsWith(`  ${assetName}`) || item.endsWith(` ${assetName}`))

  if (!line) {
    throw new OperoCliError({
      code: 'UPDATE_CHECKSUM_MISSING',
      exitCode: 5,
      message: `checksums.txt does not contain ${assetName}`,
    })
  }

  const expected = line.split(/\s+/)[0]
  const actual = createHash('sha256').update(await readFile(archivePath)).digest('hex')
  if (expected.toLowerCase() !== actual.toLowerCase()) {
    throw new OperoCliError({
      code: 'UPDATE_CHECKSUM_FAILED',
      exitCode: 5,
      message: `Checksum verification failed for ${assetName}`,
    })
  }
}

function isMissingFile(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
}
