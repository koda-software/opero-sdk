import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it, vi} from 'vitest'

import DictionariesCreate from '../src/commands/dictionaries/create.js'
import DictionariesDelete from '../src/commands/dictionaries/delete.js'
import DictionariesEntriesExport from '../src/commands/dictionaries/entries/export.js'
import DictionariesEntriesGet from '../src/commands/dictionaries/entries/get.js'
import DictionariesEntriesImport from '../src/commands/dictionaries/entries/import.js'
import DictionariesUpdate from '../src/commands/dictionaries/update.js'

type CommandInstance = {
  createApiClient: ReturnType<typeof vi.fn>
  jsonEnabled: ReturnType<typeof vi.fn>
  loadSettings: ReturnType<typeof vi.fn>
  parse: ReturnType<typeof vi.fn>
  printOutput: ReturnType<typeof vi.fn>
  run: () => Promise<unknown>
}

type CommandConstructor = new (argv: string[], config: never) => CommandInstance

describe('dictionary commands', () => {
  it('maps dictionary write requests from body files', async () => {
    const {bodyFile, cleanup} = await createBodyFile({
      entryKeyMode: 'CUSTOM',
      entries: [{isActive: true, key: 'card', value: 'Card'}],
      key: 'payment-methods',
      name: 'Payment Methods',
    })
    const client = mockClient()

    await runCommand(DictionariesCreate, client, {flags: {'body-file': bodyFile}})
    await runCommand(DictionariesUpdate, client, {args: {id: 'dictionary 1'}, flags: {'body-file': bodyFile}})
    await runCommand(DictionariesDelete, client, {args: {id: 'dictionary 1'}})

    const body = {
      entryKeyMode: 'CUSTOM',
      entries: [{isActive: true, key: 'card', value: 'Card'}],
      key: 'payment-methods',
      name: 'Payment Methods',
    }
    expect(client.post).toHaveBeenCalledWith('/v1/dictionaries', {body})
    expect(client.patch).toHaveBeenCalledWith('/v1/dictionaries/dictionary%201', {body})
    expect(client.delete).toHaveBeenCalledWith('/v1/dictionaries/dictionary%201')
    await cleanup()
  })

  it('maps dictionary entry get requests', async () => {
    const client = mockClient()

    await runCommand(DictionariesEntriesGet, client, {
      args: {
        dictionaryId: 'dictionary 1',
        entryId: 'entry 1',
      },
    })

    expect(client.get).toHaveBeenCalledWith('/v1/dictionaries/dictionary%201/entries/entry%201', {query: undefined})
  })

  it('exports dictionary entries to disk', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-dictionary-export-'))
    const out = join(dir, 'entries.csv')
    const client = {
      download: vi.fn().mockResolvedValue({
        body: streamFromText('key,value\ncard,Card\n'),
        headers: new Headers({
          'content-length': '20',
          'content-type': 'text/csv',
        }),
        status: 200,
      }),
    }

    const {result} = await runCommand(DictionariesEntriesExport, client, {
      args: {dictionaryId: 'dictionary 1'},
      flags: {
        format: 'csv',
        out,
      },
    })

    expect(result).toEqual({
      data: {
        contentDisposition: null,
        contentLength: '20',
        contentType: 'text/csv',
        dictionaryId: 'dictionary 1',
        format: 'csv',
        out,
        status: 200,
      },
    })
    expect(client.download).toHaveBeenCalledWith('/v1/dictionaries/dictionary%201/entries/export', {
      headers: {
        accept: 'text/csv',
      },
      query: {
        format: 'csv',
      },
    })
    expect(await readFile(out, 'utf8')).toBe('key,value\ncard,Card\n')
    await rm(dir, {force: true, recursive: true})
  })

  it('imports dictionary entries with multipart strategy', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-dictionary-import-'))
    const path = join(dir, 'entries.json')
    await writeFile(path, '[{"key":"card","value":"Card"}]')
    const client = mockClient()

    const {result} = await runCommand(DictionariesEntriesImport, client, {
      args: {dictionaryId: 'dictionary 1'},
      flags: {
        file: path,
        strategy: 'REPLACE',
      },
    })

    expect(result).toEqual({data: 'ok'})
    expect(client.postMultipart).toHaveBeenCalledOnce()
    expect(client.postMultipart.mock.calls[0][0]).toBe('/v1/dictionaries/dictionary%201/entries/import')
    expect(client.postMultipart.mock.calls[0][1]).toMatchObject({
      fieldName: 'file',
      filename: 'entries.json',
    })
    expect(client.postMultipart.mock.calls[0][2]).toEqual({
      fields: {
        strategy: 'REPLACE',
      },
    })
    await rm(dir, {force: true, recursive: true})
  })
})

async function runCommand(
  Command: CommandConstructor,
  client: Record<string, unknown>,
  options: {args?: Record<string, string>; flags?: Record<string, unknown>} = {},
) {
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

function mockClient() {
  return {
    delete: vi.fn().mockResolvedValue({data: null}),
    get: vi.fn().mockResolvedValue({data: 'ok'}),
    patch: vi.fn().mockResolvedValue({data: 'ok'}),
    post: vi.fn().mockResolvedValue({data: 'ok'}),
    postMultipart: vi.fn().mockResolvedValue({data: 'ok'}),
  }
}

async function createBodyFile(body: unknown): Promise<{bodyFile: string; cleanup: () => Promise<void>}> {
  const dir = await mkdtemp(join(tmpdir(), 'opero-dictionary-body-'))
  const bodyFile = join(dir, 'body.json')
  await writeFile(bodyFile, JSON.stringify(body))
  return {
    bodyFile,
    cleanup: async () => {
      await rm(dir, {force: true, recursive: true})
    },
  }
}

function streamFromText(text: string): ReadableStream<Uint8Array> {
  return new Response(text).body!
}
