export type AuthSource = 'flag' | 'env' | 'config' | 'missing'

export type OperoConfig = {
  apiToken?: string
  baseUrl?: string
  companyId?: string
  timeoutMs?: number
}

export type ResolvedSettings = {
  apiToken?: string
  authSource: AuthSource
  baseUrl: string
  companyId?: string
  configPath: string
  timeoutMs: number
}
