import {ApiError, OperoCliError} from './errors.js'
import {appendQuery, type Query} from './query.js'

export type ApiClientOptions = {
  apiToken?: string
  baseUrl: string
  timeoutMs: number
  userAgent: string
}

export type RequestOptions = {
  authRequired?: boolean
  body?: unknown
  headers?: Record<string, string>
  query?: Query
}

export type DownloadResponse = {
  body: ReadableStream<Uint8Array>
  headers: Headers
  status: number
}

export type MultipartFile = {
  bytes: Blob
  fieldName: string
  filename: string
}

export type MultipartOptions = RequestOptions & {
  fields?: Record<string, string>
}

export class ApiClient {
  private readonly apiToken?: string
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly userAgent: string

  constructor(options: ApiClientOptions) {
    this.apiToken = options.apiToken
    this.baseUrl = options.baseUrl
    this.timeoutMs = options.timeoutMs
    this.userAgent = options.userAgent
  }

  async delete(path: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request('DELETE', path, options)
  }

  async get(path: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request('GET', path, options)
  }

  async download(path: string, options: RequestOptions = {}): Promise<DownloadResponse> {
    const response = await this.fetchRaw('GET', path, {
      ...options,
      headers: {
        accept: 'application/octet-stream',
        ...options.headers,
      },
    })
    if (!response.ok) {
      throw await buildApiError(response, await parseErrorPayload(response))
    }

    if (!response.body) {
      throw new OperoCliError({
        code: 'API_ERROR',
        exitCode: 5,
        message: 'API response did not include a file stream',
      })
    }

    return {
      body: response.body,
      headers: response.headers,
      status: response.status,
    }
  }

  async patch(path: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request('PATCH', path, options)
  }

  async post(path: string, options: RequestOptions = {}): Promise<unknown> {
    return this.request('POST', path, options)
  }

  async postMultipart(path: string, file: MultipartFile, options: MultipartOptions = {}): Promise<unknown> {
    const body = new FormData()
    body.append(file.fieldName, file.bytes, file.filename)
    for (const [key, value] of Object.entries(options.fields ?? {})) {
      body.append(key, value)
    }

    const response = await this.fetchRaw('POST', path, {
      ...options,
      body,
    })

    return await parseResponse(response)
  }

  async request(method: string, path: string, options: RequestOptions = {}): Promise<unknown> {
    const response = await this.fetchRaw(method, path, options)
    return await parseResponse(response)
  }

  private async fetchRaw(method: string, path: string, options: RequestOptions = {}): Promise<Response> {
    if (!path.startsWith('/')) {
      throw new OperoCliError({
        code: 'USAGE_ERROR',
        exitCode: 2,
        message: 'API path must start with /',
      })
    }

    if (options.authRequired !== false && !this.apiToken) {
      throw new OperoCliError({
        code: 'MISSING_AUTH',
        exitCode: 4,
        message: 'Missing Opero API token. Set OPERO_API_TOKEN or run opero auth login.',
      })
    }

    const url = new URL(path, `${this.baseUrl}/`)
    appendQuery(url.searchParams, options.query)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const headers: Record<string, string> = {
        accept: 'application/json',
        'user-agent': this.userAgent,
        ...options.headers,
      }

      let body: BodyInit | undefined
      if (options.body !== undefined) {
        if (options.body instanceof FormData) {
          body = options.body
        } else {
          headers['content-type'] = 'application/json'
          body = JSON.stringify(options.body)
        }
      }

      if (this.apiToken && options.authRequired !== false) {
        headers.authorization = `Bearer ${this.apiToken}`
      }

      return await fetch(url, {
        body,
        headers,
        method,
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof ApiError || error instanceof OperoCliError) throw error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new OperoCliError({
          code: 'TIMEOUT',
          exitCode: 6,
          message: `Request timed out after ${this.timeoutMs}ms`,
        })
      }

      throw new OperoCliError({
        code: 'NETWORK_ERROR',
        details: error instanceof Error ? error.message : undefined,
        exitCode: 6,
        message: 'Network request failed',
      })
    } finally {
      clearTimeout(timeout)
    }
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    if (!response.ok) throw await buildApiError(response, undefined)
    return {data: null}
  }

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json().catch(() => undefined) : await response.text()

  if (!response.ok) {
    throw await buildApiError(response, payload)
  }

  return payload
}

async function buildApiError(response: Response, payload: unknown): Promise<ApiError> {
  const body = payload ?? (await response.text().catch(() => undefined))
  const apiError = getApiErrorBody(body)

  return new ApiError({
    code: apiError.code ?? 'API_ERROR',
    details: apiError.details,
    message: apiError.message ?? `API request failed with status ${response.status}`,
    status: response.status,
  })
}

async function parseErrorPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) return await response.json().catch(() => undefined)
  return await response.text().catch(() => undefined)
}

function getApiErrorBody(payload: unknown): {code?: string; details?: unknown; message?: string} {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    return {details: payload}
  }

  const error = payload.error
  if (!error || typeof error !== 'object') {
    return {details: payload}
  }

  const code = 'code' in error && typeof error.code === 'string' ? error.code : undefined
  const message = 'message' in error && typeof error.message === 'string' ? error.message : undefined
  const details = Object.fromEntries(Object.entries(error).filter(([key]) => !['code', 'message'].includes(key)))

  return {
    code,
    details: Object.keys(details).length > 0 ? details : undefined,
    message,
  }
}
