import {ApiClient} from '../api/client.js'
import type {OperoConfig, ResolvedSettings} from './types.js'
import {writeConfig} from './write.js'

export async function validateAndSaveToken(args: {
  apiToken: string
  client: ApiClient
  config: OperoConfig
  configPath: string
  settings: ResolvedSettings
}): Promise<void> {
  await args.client.get('/v1/ping')

  await writeConfig(args.configPath, {
    ...args.config,
    apiToken: args.apiToken,
    baseUrl: args.settings.baseUrl,
    timeoutMs: args.settings.timeoutMs,
  })
}
