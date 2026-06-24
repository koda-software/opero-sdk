import {createInterface} from 'node:readline/promises'
import {stdin as input, stdout as output} from 'node:process'

import {OperoCliError} from '../api/errors.js'

export async function promptText(question: string, defaultValue?: string): Promise<string> {
  ensureInteractive()
  const rl = createInterface({input, output})
  try {
    const suffix = defaultValue ? ` (${defaultValue})` : ''
    const answer = (await rl.question(`${question}${suffix}: `)).trim()
    return answer || defaultValue || ''
  } finally {
    rl.close()
  }
}

export async function promptSecret(question: string): Promise<string> {
  ensureInteractive()
  const stdin = process.stdin
  const stdout = process.stdout

  return new Promise((resolve, reject) => {
    const onData = (char: Buffer) => {
      const value = char.toString('utf8')
      switch (value) {
        case '\n':
        case '\r':
        case '\u0004': {
          stdout.write('\n')
          cleanup()
          resolve(buffer)
          break
        }

        case '\u0003': {
          stdout.write('\n')
          cleanup()
          reject(new OperoCliError({code: 'USAGE_ERROR', exitCode: 2, message: 'Prompt cancelled'}))
          break
        }

        case '\b':
        case '\u007f': {
          buffer = buffer.slice(0, -1)
          break
        }

        default: {
          buffer += value
        }
      }
    }

    let buffer = ''
    const wasRaw = stdin.isRaw

    const cleanup = () => {
      stdin.off('data', onData)
      if (stdin.isTTY) stdin.setRawMode(wasRaw)
      stdin.pause()
    }

    stdout.write(`${question}: `)
    stdin.resume()
    stdin.setEncoding('utf8')
    if (stdin.isTTY) stdin.setRawMode(true)
    stdin.on('data', onData)
  })
}

function ensureInteractive(): void {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new OperoCliError({
      code: 'USAGE_ERROR',
      exitCode: 2,
      message: 'Interactive prompt requires a TTY. Pass --base-url and --api-token for non-interactive setup.',
    })
  }
}
