import {createWriteStream} from 'node:fs'
import {mkdir, readFile, stat} from 'node:fs/promises'
import {dirname} from 'node:path'
import {Readable} from 'node:stream'
import {pipeline} from 'node:stream/promises'

import {OperoCliError} from '../api/errors.js'

export async function readUploadFile(path: string): Promise<Blob> {
  try {
    const info = await stat(path)
    if (!info.isFile()) {
      throw new OperoCliError({
        code: 'FILE_ERROR',
        exitCode: 7,
        message: `Upload path is not a file: ${path}`,
      })
    }

    const bytes = await readFile(path)
    return new Blob([bytes])
  } catch (error) {
    if (error instanceof OperoCliError) throw error
    throw new OperoCliError({
      code: 'FILE_ERROR',
      details: error instanceof Error ? error.message : undefined,
      exitCode: 7,
      message: `Could not read upload file: ${path}`,
    })
  }
}

export async function writeDownloadFile(path: string, body: ReadableStream<Uint8Array>, options: {createDirs?: boolean; force?: boolean}): Promise<void> {
  try {
    if (!options.force && (await exists(path))) {
      throw new OperoCliError({
        code: 'FILE_ERROR',
        exitCode: 7,
        message: `Refusing to overwrite existing file: ${path}. Re-run with --force.`,
      })
    }

    if (options.createDirs) {
      await mkdir(dirname(path), {recursive: true})
    }

    await pipeline(Readable.fromWeb(body as unknown as import('node:stream/web').ReadableStream), createWriteStream(path))
  } catch (error) {
    if (error instanceof OperoCliError) throw error
    throw new OperoCliError({
      code: 'FILE_ERROR',
      details: error instanceof Error ? error.message : undefined,
      exitCode: 7,
      message: `Could not write downloaded file: ${path}`,
    })
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
