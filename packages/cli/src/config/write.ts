import {mkdir, writeFile} from 'node:fs/promises'
import {dirname} from 'node:path'

import type {OperoConfig} from './types.js'

export async function writeConfig(configPath: string, config: OperoConfig): Promise<void> {
  await mkdir(dirname(configPath), {recursive: true})
  await writeFile(configPath, `${JSON.stringify(sortConfig(config), null, 2)}\n`, {mode: 0o600})
}

function sortConfig(config: OperoConfig): OperoConfig {
  return {
    ...(config.baseUrl ? {baseUrl: config.baseUrl} : {}),
    ...(config.timeoutMs ? {timeoutMs: config.timeoutMs} : {}),
    ...(config.apiToken ? {apiToken: config.apiToken} : {}),
  }
}
