import {readFile} from 'node:fs/promises'

import {OperoCliError} from './errors.js'

export async function readJsonBodyFile(path: string | undefined): Promise<unknown | undefined> {
  if (!path) return undefined
  const raw = path === '-' ? await readStdin() : await readFileBody(path)
  try {
    return JSON.parse(raw) as unknown
  } catch (error) {
    throw new OperoCliError({
      code: 'INVALID_JSON',
      details: error instanceof Error ? error.message : undefined,
      exitCode: 2,
      message: `Body file ${path} does not contain valid JSON`,
    })
  }
}

async function readFileBody(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    throw new OperoCliError({
      code: 'FILE_ERROR',
      details: error instanceof Error ? error.message : undefined,
      exitCode: 7,
      message: `Could not read body file ${path}`,
    })
  }
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return Buffer.concat(chunks).toString('utf8')
}
