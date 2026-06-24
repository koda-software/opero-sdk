export type AuthSource = 'flag' | 'env' | 'config' | 'missing'

export type OperoConfig = {
  apiToken?: string
  baseUrl?: string
  timeoutMs?: number
}

export type ResolvedSettings = {
  apiToken?: string
  authSource: AuthSource
  baseUrl: string
  configPath: string
  timeoutMs: number
}
