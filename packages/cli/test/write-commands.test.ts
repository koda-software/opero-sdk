import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it, vi} from 'vitest'

import {OperoCliError} from '../src/api/errors.js'
import EntityAttachmentsCreate from '../src/commands/entity-attachments/create.js'
import EntityAttachmentsDelete from '../src/commands/entity-attachments/delete.js'
import EntityAttachmentsList from '../src/commands/entity-attachments/list.js'
import EntityAttachmentsUpdate from '../src/commands/entity-attachments/update.js'
import EntityCommentsCreate from '../src/commands/entity-comments/create.js'
import EntityCommentsDelete from '../src/commands/entity-comments/delete.js'
import EntityCommentsGet from '../src/commands/entity-comments/get.js'
import EntityCommentsList from '../src/commands/entity-comments/list.js'
import EntityCommentsUpdate from '../src/commands/entity-comments/update.js'
import ServiceCatalogArchive from '../src/commands/service-catalog/archive.js'
import ServiceCatalogCreate from '../src/commands/service-catalog/create.js'
import ServiceCatalogGet from '../src/commands/service-catalog/get.js'
import ServiceCatalogList from '../src/commands/service-catalog/list.js'
import ServiceCatalogRestore from '../src/commands/service-catalog/restore.js'
import ServiceCatalogUpdate from '../src/commands/service-catalog/update.js'

type CommandInstance = {
  createApiClient: ReturnType<typeof vi.fn>
  jsonEnabled: ReturnType<typeof vi.fn>
  loadSettings: ReturnType<typeof vi.fn>
  parse: ReturnType<typeof vi.fn>
  printOutput: ReturnType<typeof vi.fn>
  run: () => Promise<unknown>
}

type CommandConstructor = new (argv: string[], config: never) => CommandInstance

describe('service catalog commands', () => {
  it('lists service catalog items with list flags and search', async () => {
    const client = mockClient()

    await runCommand(ServiceCatalogList, client, {
      flags: {
        columns: 'id,name',
        limit: 10,
        page: 2,
        search: 'hosting',
      },
    })

    expect(client.get).toHaveBeenCalledWith('/v1/companies/company%201/service-catalog/items', {
      query: {
        columns: '["id","name"]',
        limit: 10,
        page: 2,
        search: 'hosting',
      },
    })
  })

  it('gets one service catalog item', async () => {
    const client = mockClient()

    await runCommand(ServiceCatalogGet, client, {args: {id: 'item 1'}})

    expect(client.get).toHaveBeenCalledWith('/v1/companies/company%201/service-catalog/items/item%201', {query: undefined})
  })

  it('creates and updates service catalog items from body files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-body-'))
    const bodyFile = join(dir, 'item.json')
    await writeFile(bodyFile, JSON.stringify({code: 'HOSTING', name: 'Hosting'}))
    const client = mockClient()

    await runCommand(ServiceCatalogCreate, client, {flags: {'body-file': bodyFile}})
    await runCommand(ServiceCatalogUpdate, client, {args: {id: 'item 1'}, flags: {'body-file': bodyFile}})

    expect(client.post).toHaveBeenCalledWith('/v1/companies/company%201/service-catalog/items', {
      body: {code: 'HOSTING', name: 'Hosting'},
    })
    expect(client.patch).toHaveBeenCalledWith('/v1/companies/company%201/service-catalog/items/item%201', {
      body: {code: 'HOSTING', name: 'Hosting'},
    })
    await rm(dir, {force: true, recursive: true})
  })

  it('archives and restores service catalog items without request bodies', async () => {
    const client = mockClient()

    await runCommand(ServiceCatalogArchive, client, {args: {id: 'item 1'}})
    await runCommand(ServiceCatalogRestore, client, {args: {id: 'item 1'}})

    expect(client.patch).toHaveBeenCalledWith('/v1/companies/company%201/service-catalog/items/item%201/archive')
    expect(client.patch).toHaveBeenCalledWith('/v1/companies/company%201/service-catalog/items/item%201/restore')
  })
})

describe('entity attachment commands', () => {
  it('lists entity attachments by entity', async () => {
    const client = mockClient()

    await runCommand(EntityAttachmentsList, client, {
      flags: {
        'entity-id': 'contractor 1',
        'entity-type': 'contractor',
      },
    })

    expect(client.get).toHaveBeenCalledWith('/v1/companies/company%201/entity-attachments', {
      query: {
        entityId: 'contractor 1',
        entityType: 'contractor',
      },
    })
  })

  it('creates entity attachments from explicit flags', async () => {
    const client = mockClient()

    await runCommand(EntityAttachmentsCreate, client, {
      flags: {
        description: 'Signed agreement',
        'display-name': 'Agreement',
        'entity-id': 'contractor 1',
        'entity-type': 'contractor',
        'file-id': 'file 1',
        kind: 'contract',
        'metadata-json': '{"source":"cli"}',
        position: 3,
      },
    })

    expect(client.post).toHaveBeenCalledWith('/v1/companies/company%201/entity-attachments', {
      body: {
        description: 'Signed agreement',
        displayName: 'Agreement',
        entityId: 'contractor 1',
        entityType: 'contractor',
        fileId: 'file 1',
        kind: 'contract',
        metadata: {source: 'cli'},
        position: 3,
      },
    })
  })

  it('rejects invalid entity attachment metadata JSON', async () => {
    const client = mockClient()

    await expect(
      runCommand(EntityAttachmentsCreate, client, {
        flags: {
          'entity-id': 'contractor 1',
          'entity-type': 'contractor',
          'file-id': 'file 1',
          'metadata-json': '{',
        },
      }),
    ).rejects.toBeInstanceOf(OperoCliError)
  })

  it('updates entity attachments from body files and deletes immediately', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-body-'))
    const bodyFile = join(dir, 'attachment.json')
    await writeFile(bodyFile, JSON.stringify({displayName: 'Updated'}))
    const client = mockClient()

    await runCommand(EntityAttachmentsUpdate, client, {args: {id: 'attachment 1'}, flags: {'body-file': bodyFile}})
    await runCommand(EntityAttachmentsDelete, client, {args: {id: 'attachment 1'}})

    expect(client.patch).toHaveBeenCalledWith('/v1/companies/company%201/entity-attachments/attachment%201', {
      body: {displayName: 'Updated'},
    })
    expect(client.delete).toHaveBeenCalledWith('/v1/companies/company%201/entity-attachments/attachment%201')
    await rm(dir, {force: true, recursive: true})
  })
})

describe('entity comment commands', () => {
  it('lists entity comments with path params and list flags', async () => {
    const client = mockClient()

    await runCommand(EntityCommentsList, client, {
      flags: {
        columns: 'id,body',
        'entity-id': 'contractor 1',
        'entity-type': 'contractor',
        limit: 5,
        page: 2,
      },
    })

    expect(client.get).toHaveBeenCalledWith('/v1/companies/company%201/entity-comments/contractor/contractor%201', {
      query: {
        columns: '["id","body"]',
        limit: 5,
        page: 2,
      },
    })
  })

  it('gets one entity comment', async () => {
    const client = mockClient()

    await runCommand(EntityCommentsGet, client, {args: {id: 'comment 1'}})

    expect(client.get).toHaveBeenCalledWith('/v1/companies/company%201/entity-comments/comments/comment%201', {query: undefined})
  })

  it('creates entity comments from direct body flags', async () => {
    const client = mockClient()

    await runCommand(EntityCommentsCreate, client, {
      flags: {
        body: 'Please verify billing address',
        'entity-id': 'contractor 1',
        'entity-type': 'contractor',
        'metadata-json': '{"source":"cli"}',
      },
    })

    expect(client.post).toHaveBeenCalledWith('/v1/companies/company%201/entity-comments', {
      body: {
        body: 'Please verify billing address',
        entityId: 'contractor 1',
        entityType: 'contractor',
        metadata: {source: 'cli'},
      },
    })
  })

  it('creates entity comments from body files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-comment-'))
    const bodyFile = join(dir, 'comment.json')
    await writeFile(bodyFile, JSON.stringify({body: 'From file', entityId: 'contractor 1', entityType: 'contractor'}))
    const client = mockClient()

    await runCommand(EntityCommentsCreate, client, {
      flags: {
        'body-file': bodyFile,
        'entity-id': 'ignored-by-body-file',
        'entity-type': 'contractor',
      },
    })

    expect(client.post).toHaveBeenCalledWith('/v1/companies/company%201/entity-comments', {
      body: {
        body: 'From file',
        entityId: 'contractor 1',
        entityType: 'contractor',
      },
    })
    await rm(dir, {force: true, recursive: true})
  })

  it('rejects missing comment body and invalid metadata JSON', async () => {
    const client = mockClient()

    await expect(
      runCommand(EntityCommentsCreate, client, {
        flags: {
          'entity-id': 'contractor 1',
          'entity-type': 'contractor',
        },
      }),
    ).rejects.toMatchObject({
      code: 'USAGE_ERROR',
    })

    await expect(
      runCommand(EntityCommentsCreate, client, {
        flags: {
          body: 'Comment',
          'entity-id': 'contractor 1',
          'entity-type': 'contractor',
          'metadata-json': '{',
        },
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_JSON',
    })
  })

  it('updates entity comments from body files and deletes immediately', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-comment-'))
    const bodyFile = join(dir, 'comment.json')
    await writeFile(bodyFile, JSON.stringify({body: 'Updated'}))
    const client = mockClient()

    await runCommand(EntityCommentsUpdate, client, {args: {id: 'comment 1'}, flags: {'body-file': bodyFile}})
    await runCommand(EntityCommentsDelete, client, {args: {id: 'comment 1'}})

    expect(client.patch).toHaveBeenCalledWith('/v1/companies/company%201/entity-comments/comments/comment%201', {
      body: {body: 'Updated'},
    })
    expect(client.delete).toHaveBeenCalledWith('/v1/companies/company%201/entity-comments/comments/comment%201')
    await rm(dir, {force: true, recursive: true})
  })
})

async function runCommand(Command: CommandConstructor, client: Record<string, unknown>, options: {args?: Record<string, string>; flags?: Record<string, unknown>} = {}) {
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

  return await command.run()
}

function mockClient() {
  return {
    delete: vi.fn().mockResolvedValue({data: null}),
    get: vi.fn().mockResolvedValue({data: 'ok'}),
    patch: vi.fn().mockResolvedValue({data: 'ok'}),
    post: vi.fn().mockResolvedValue({data: 'ok'}),
  }
}
