import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {afterEach, describe, expect, it, vi} from 'vitest'

import {ApiClient} from '../src/api/client.js'
import {ApiError, OperoCliError} from '../src/api/errors.js'
import FilesDownload from '../src/commands/files/download.js'
import FilesGet from '../src/commands/files/get.js'
import FilesUpload from '../src/commands/files/upload.js'
import {readUploadFile, writeDownloadFile} from '../src/files/io.js'

type CommandInstance = {
  createApiClient: ReturnType<typeof vi.fn>
  jsonEnabled: ReturnType<typeof vi.fn>
  loadSettings: ReturnType<typeof vi.fn>
  parse: ReturnType<typeof vi.fn>
  printOutput: ReturnType<typeof vi.fn>
  run: () => Promise<unknown>
}

type CommandConstructor = new (argv: string[], config: never) => CommandInstance

const clientOptions = {
  apiToken: 'test-token',
  baseUrl: 'https://api.example',
  timeoutMs: 30_000,
  userAgent: 'opero/test',
}

describe('ApiClient file transport', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uploads multipart files without a company header for company route paths', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({data: {id: 'file-1'}}))
    const client = new ApiClient({...clientOptions, companyId: 'company-1'})

    const result = await client.postMultipart(
      '/v1/companies/company-1/files/attachments',
      {
        bytes: new Blob(['hello']),
        fieldName: 'file',
        filename: 'hello.txt',
      },
      {
        fields: {
          strategy: 'MERGE',
        },
      },
    )

    expect(result).toEqual({data: {id: 'file-1'}})
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('https://api.example/v1/companies/company-1/files/attachments')
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({
      authorization: 'Bearer test-token',
    })
    expect(init?.headers).not.toMatchObject({'X-Company-Id': 'company-1'})
    expect((init?.headers as Record<string, string>)['content-type']).toBeUndefined()
    expect(init?.body).toBeInstanceOf(FormData)
    expect((init?.body as FormData).get('file')).toBeInstanceOf(Blob)
    expect((init?.body as FormData).get('strategy')).toBe('MERGE')
  })

  it('returns checked download streams', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('downloaded', {
        headers: {'content-length': '10', 'content-type': 'text/plain'},
        status: 206,
      }),
    )
    const client = new ApiClient({...clientOptions, companyId: 'company-1'})

    const response = await client.download('/v1/companies/company-1/files/file-1/download', {
      headers: {Range: 'bytes=0-9'},
    })

    expect(response.status).toBe(206)
    expect(response.headers.get('content-type')).toBe('text/plain')
    expect(response.body).toBeTruthy()
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Range: 'bytes=0-9',
      accept: 'application/octet-stream',
    })
    expect(fetchMock.mock.calls[0][1]?.headers).not.toMatchObject({'X-Company-Id': 'company-1'})
  })

  it('lets explicit request headers override the configured company header', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({data: {ok: true}}))
    const client = new ApiClient({...clientOptions, companyId: 'configured-company'})

    await client.get('/v1/header-backed-endpoint', {
      headers: {
        'X-Company-Id': 'request-company',
      },
    })

    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      'X-Company-Id': 'request-company',
    })
  })

  it('can suppress the configured company header for organization-scoped endpoints', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({data: []}))
    const client = new ApiClient({...clientOptions, companyId: 'company-1'})

    await client.get('/v1/companies', {
      companyScoped: false,
    })

    expect(fetchMock.mock.calls[0][1]?.headers).not.toMatchObject({
      'X-Company-Id': 'company-1',
    })
  })

  it('normalizes download API errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Missing file',
          },
        },
        404,
      ),
    )
    const client = new ApiClient(clientOptions)

    await expect(client.download('/v1/companies/company-1/files/missing/download')).rejects.toBeInstanceOf(ApiError)
  })
})

describe('file IO helpers', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
  })

  it('reads upload files as blobs', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-upload-'))
    const path = join(dir, 'sample.txt')
    await writeFile(path, 'hello')

    const blob = await readUploadFile(path)

    expect(await blob.text()).toBe('hello')
    await rm(dir, {force: true, recursive: true})
  })

  it('refuses to overwrite downloads without --force', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-download-'))
    const path = join(dir, 'sample.txt')
    await writeFile(path, 'existing')

    await expect(writeDownloadFile(path, streamFromText('new'), {force: false})).rejects.toMatchObject({
      code: 'FILE_ERROR',
      exitCode: 7,
    })
    expect(await readFile(path, 'utf8')).toBe('existing')
    await rm(dir, {force: true, recursive: true})
  })

  it('creates parent directories when requested', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-download-'))
    const path = join(dir, 'nested', 'sample.txt')

    await writeDownloadFile(path, streamFromText('downloaded'), {createDirs: true})

    expect(await readFile(path, 'utf8')).toBe('downloaded')
    await rm(dir, {force: true, recursive: true})
  })
})

describe('file commands', () => {
  it('wires files get to metadata endpoint', async () => {
    const client = {get: vi.fn().mockResolvedValue({data: {id: 'file-1'}})}

    const {result} = await runCommand(FilesGet, client, {
      args: {id: 'file 1'},
      flags: {},
    })

    expect(result).toEqual({data: {id: 'file-1'}})
    expect(client.get).toHaveBeenCalledWith('/v1/companies/company%201/files/file%201', {query: undefined})
  })

  it('wires files upload to multipart endpoint', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-command-upload-'))
    const path = join(dir, 'sample.txt')
    await writeFile(path, 'hello')
    const client = {postMultipart: vi.fn().mockResolvedValue({data: {id: 'file-1'}})}

    const {result} = await runCommand(FilesUpload, client, {
      flags: {file: path},
    })

    expect(result).toEqual({data: {id: 'file-1'}})
    expect(client.postMultipart).toHaveBeenCalledOnce()
    expect(client.postMultipart.mock.calls[0][0]).toBe('/v1/companies/company%201/files/attachments')
    expect(client.postMultipart.mock.calls[0][1]).toMatchObject({
      fieldName: 'file',
      filename: 'sample.txt',
    })
    await rm(dir, {force: true, recursive: true})
  })

  it('wires files download to stream endpoint and writes output', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-command-download-'))
    const out = join(dir, 'nested', 'sample.txt')
    const headers = new Headers({
      'content-length': '10',
      'content-type': 'text/plain',
    })
    const client = {
      download: vi.fn().mockResolvedValue({
        body: streamFromText('downloaded'),
        headers,
        status: 206,
      }),
    }

    const {result} = await runCommand(FilesDownload, client, {
      args: {id: 'file 1'},
      flags: {
        'create-dirs': true,
        out,
        range: 'bytes=0-9',
      },
    })

    expect(result).toEqual({
      data: {
        contentDisposition: null,
        contentLength: '10',
        contentType: 'text/plain',
        id: 'file 1',
        out,
        status: 206,
      },
    })
    expect(client.download).toHaveBeenCalledWith('/v1/companies/company%201/files/file%201/download', {
      headers: {Range: 'bytes=0-9'},
    })
    expect(await readFile(out, 'utf8')).toBe('downloaded')
    await rm(dir, {force: true, recursive: true})
  })
})

async function runCommand(Command: CommandConstructor, client: Record<string, unknown>, options: {args?: Record<string, string>; flags?: Record<string, unknown>}) {
  const command = new Command([], {} as never)
  command.parse = vi.fn().mockResolvedValue({
    args: options.args ?? {},
    flags: options.flags ?? {},
  })
  command.loadSettings = vi.fn().mockResolvedValue({
    config: {},
    settings: {
      apiToken: 'test-token',
      authSource: 'flag',
      baseUrl: 'https://api.example',
      timeoutMs: 30_000,
      companyId: 'company 1',
    },
  })
  command.createApiClient = vi.fn().mockReturnValue(client)
  command.jsonEnabled = vi.fn().mockReturnValue(true)
  command.printOutput = vi.fn()

  return {
    command,
    result: await command.run(),
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: {'content-type': 'application/json'},
    status,
  })
}

function streamFromText(text: string): ReadableStream<Uint8Array> {
  return new Response(text).body!
}
