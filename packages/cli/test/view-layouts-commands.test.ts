import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it, vi} from 'vitest'

import ViewLayoutsArchive from '../src/commands/view-layouts/archive.js'
import ViewLayoutsAssignmentsReplace from '../src/commands/view-layouts/assignments/replace.js'
import ViewLayoutsCatalog from '../src/commands/view-layouts/catalog.js'
import ViewLayoutsCreate from '../src/commands/view-layouts/create.js'
import ViewLayoutsCustomFieldTypes from '../src/commands/view-layouts/custom-field-types.js'
import ViewLayoutsDraftSave from '../src/commands/view-layouts/draft/save.js'
import ViewLayoutsDraftStagedFieldDefinitionsOptions from '../src/commands/view-layouts/draft/staged-field-definitions/options.js'
import ViewLayoutsGet from '../src/commands/view-layouts/get.js'
import ViewLayoutsList from '../src/commands/view-layouts/list.js'
import ViewLayoutsPublish from '../src/commands/view-layouts/publish.js'
import ViewLayoutsResolve from '../src/commands/view-layouts/resolve.js'
import ViewLayoutsRuntimeContextVariables from '../src/commands/view-layouts/runtime-context-variables.js'
import ViewLayoutsRuntimeData from '../src/commands/view-layouts/runtime-data.js'
import ViewLayoutsRuntimeDynamicObjectRecordsCreate from '../src/commands/view-layouts/runtime/dynamic-object/records/create.js'
import ViewLayoutsRuntimeDynamicObjectRecordsUpdate from '../src/commands/view-layouts/runtime/dynamic-object/records/update.js'
import ViewLayoutsRuntimeDynamicObjectRelationTablesQuery from '../src/commands/view-layouts/runtime/dynamic-object/relation-tables/query.js'
import ViewLayoutsRuntimeDynamicObjectRelationTablesTableLayout from '../src/commands/view-layouts/runtime/dynamic-object/relation-tables/table-layout.js'
import ViewLayoutsRuntimeDynamicObjectRelationTablesTargetLayout from '../src/commands/view-layouts/runtime/dynamic-object/relation-tables/target-layout.js'
import ViewLayoutsSurfaceCapabilities from '../src/commands/view-layouts/surface-capabilities.js'
import ViewLayoutsSurfaceDefinitions from '../src/commands/view-layouts/surface-definitions.js'
import ViewLayoutsUpdate from '../src/commands/view-layouts/update.js'
import ViewLayoutsVersionsGet from '../src/commands/view-layouts/versions/get.js'
import ViewLayoutsVersionsList from '../src/commands/view-layouts/versions/list.js'
import ViewLayoutsVersionsRestoreDraft from '../src/commands/view-layouts/versions/restore-draft.js'

type CommandInstance = {
  createApiClient: ReturnType<typeof vi.fn>
  jsonEnabled: ReturnType<typeof vi.fn>
  loadSettings: ReturnType<typeof vi.fn>
  parse: ReturnType<typeof vi.fn>
  printOutput: ReturnType<typeof vi.fn>
  run: () => Promise<unknown>
}

type CommandConstructor = new (argv: string[], config: never) => CommandInstance

describe('view layout commands', () => {
  it('maps management and discovery read requests', async () => {
    const client = mockClient()
    const contextFlags = {
      'dashboard-key': 'ops',
      'entity-id': 'entity 1',
      expand: 'owner,stage',
      'form-id': 'form 1',
      'layout-id': 'layout explicit',
      mode: 'EDIT',
      'module-key': 'crm module',
      'object-key': 'deal type',
      'record-id': 'record 1',
      'scope-id': 'scope 1',
      surface: 'DYNAMIC_OBJECT',
    }

    await runCommand(ViewLayoutsList, client, {
      flags: {
        columns: 'id,name',
        count: 'hasMore',
        'dashboard-key': 'ops',
        'filter-json': '{"op":"AND","items":[]}',
        'form-id': 'form 1',
        limit: 10,
        mode: 'EDIT',
        'module-key': 'crm module',
        'object-key': 'deal type',
        page: 2,
        'scope-id': 'scope 1',
        'sort-json': '[{"field":"createdAt","direction":"desc"}]',
        surface: 'DYNAMIC_OBJECT',
      },
    })
    await runCommand(ViewLayoutsGet, client, {args: {layoutId: 'layout 1'}})
    await runCommand(ViewLayoutsResolve, client, {flags: contextFlags})
    await runCommand(ViewLayoutsCatalog, client, {flags: {...contextFlags, 'draft-version-id': 'draft 1'}})
    await runCommand(ViewLayoutsCustomFieldTypes, client)
    await runCommand(ViewLayoutsSurfaceCapabilities, client)
    await runCommand(ViewLayoutsSurfaceDefinitions, client, {flags: {surface: 'DYNAMIC_OBJECT'}})
    await runCommand(ViewLayoutsRuntimeContextVariables, client, {
      args: {layoutId: 'layout 1'},
      flags: {'entity-id': 'entity 1', mode: 'VIEW', 'record-id': 'record 1'},
    })
    await runCommand(ViewLayoutsDraftStagedFieldDefinitionsOptions, client, {
      args: {draftFieldDefinitionId: 'draft field 1', layoutId: 'layout 1'},
      flags: {limit: 5, page: 2, search: 'active'},
    })
    await runCommand(ViewLayoutsVersionsList, client, {args: {layoutId: 'layout 1'}})
    await runCommand(ViewLayoutsVersionsGet, client, {args: {layoutId: 'layout 1', versionId: 'version 1'}})
    await runCommand(ViewLayoutsRuntimeDynamicObjectRelationTablesTargetLayout, client, {
      args: {relationFieldKey: 'line items'},
      flags: {...contextFlags, 'target-form-id': 'target form 1', 'target-mode': 'CREATE'},
    })

    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts', {
      query: {
        columns: '["id","name"]',
        count: 'hasMore',
        dashboardKey: 'ops',
        filters: '{"op":"AND","items":[]}',
        formId: 'form 1',
        limit: 10,
        mode: 'EDIT',
        moduleKey: 'crm module',
        objectKey: 'deal type',
        page: 2,
        scopeId: 'scope 1',
        sort: '[{"field":"createdAt","direction":"desc"}]',
        surface: 'DYNAMIC_OBJECT',
      },
    })
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/layout%201', {query: undefined})
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/resolve', {query: expectedContextQuery()})
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/catalog', {query: {...expectedContextQuery(), draftVersionId: 'draft 1'}})
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/custom-field-types', {query: undefined})
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/surface-capabilities', {query: undefined})
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/surface-definitions', {query: {surface: 'DYNAMIC_OBJECT'}})
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/layout%201/runtime-context-variables', {
      query: {entityId: 'entity 1', mode: 'VIEW', recordId: 'record 1'},
    })
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/layout%201/draft/staged-field-definitions/draft%20field%201/options', {
      query: {limit: 5, page: 2, search: 'active'},
    })
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/layout%201/versions', {query: undefined})
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/layout%201/versions/version%201', {query: undefined})
    expect(client.get).toHaveBeenCalledWith('/v1/view-layouts/runtime/dynamic-object/relation-tables/line%20items/target-layout', {
      query: {...expectedContextQuery(), targetFormId: 'target form 1', targetMode: 'CREATE'},
    })
  })

  it('maps management, draft, publish, assignment, and runtime write requests', async () => {
    const {bodyFile, cleanup} = await createBodyFile({clientMutationId: 'mutation 1'})
    const client = mockClient()
    const flags = {
      'body-file': bodyFile,
      'dashboard-key': 'ops',
      'entity-id': 'entity 1',
      expand: 'owner,stage',
      'form-id': 'form 1',
      'layout-id': 'layout explicit',
      mode: 'EDIT',
      'module-key': 'crm module',
      'object-key': 'deal type',
      'record-id': 'record 1',
      'scope-id': 'scope 1',
      surface: 'DYNAMIC_OBJECT',
    }

    await runCommand(ViewLayoutsCreate, client, {flags: {'body-file': bodyFile}})
    await runCommand(ViewLayoutsUpdate, client, {args: {layoutId: 'layout 1'}, flags: {'body-file': bodyFile}})
    await runCommand(ViewLayoutsArchive, client, {args: {layoutId: 'layout 1'}})
    await runCommand(ViewLayoutsDraftSave, client, {args: {layoutId: 'layout 1'}, flags: {'body-file': bodyFile}})
    await runCommand(ViewLayoutsPublish, client, {args: {layoutId: 'layout 1'}, flags: {'body-file': bodyFile}})
    await runCommand(ViewLayoutsAssignmentsReplace, client, {args: {layoutId: 'layout 1'}, flags: {'body-file': bodyFile}})
    await runCommand(ViewLayoutsVersionsRestoreDraft, client, {args: {layoutId: 'layout 1', versionId: 'version 1'}, flags: {'body-file': bodyFile}})
    await runCommand(ViewLayoutsRuntimeData, client, {flags})
    await runCommand(ViewLayoutsRuntimeDynamicObjectRecordsCreate, client, {flags})
    await runCommand(ViewLayoutsRuntimeDynamicObjectRecordsUpdate, client, {args: {recordId: 'record 1'}, flags})
    await runCommand(ViewLayoutsRuntimeDynamicObjectRelationTablesTableLayout, client, {flags})
    await runCommand(ViewLayoutsRuntimeDynamicObjectRelationTablesQuery, client, {
      args: {recordId: 'record 1', relationFieldKey: 'line items'},
      flags: {...flags, 'target-form-id': 'target form 1', 'target-mode': 'VIEW'},
    })

    const body = {clientMutationId: 'mutation 1'}
    expect(client.post).toHaveBeenCalledWith('/v1/view-layouts', {body})
    expect(client.patch).toHaveBeenCalledWith('/v1/view-layouts/layout%201', {body})
    expect(client.post).toHaveBeenCalledWith('/v1/view-layouts/layout%201/archive')
    expect(client.request).toHaveBeenCalledWith('PUT', '/v1/view-layouts/layout%201/draft', {body})
    expect(client.post).toHaveBeenCalledWith('/v1/view-layouts/layout%201/publish', {body})
    expect(client.request).toHaveBeenCalledWith('PUT', '/v1/view-layouts/layout%201/assignments', {body})
    expect(client.post).toHaveBeenCalledWith('/v1/view-layouts/layout%201/versions/version%201/restore-draft', {body})
    expect(client.post).toHaveBeenCalledWith('/v1/view-layouts/runtime-data', {body, query: expectedContextQuery()})
    expect(client.post).toHaveBeenCalledWith('/v1/view-layouts/runtime/dynamic-object/records', {body, query: expectedContextQuery()})
    expect(client.patch).toHaveBeenCalledWith('/v1/view-layouts/runtime/dynamic-object/records/record%201', {body, query: expectedContextQuery()})
    expect(client.post).toHaveBeenCalledWith('/v1/view-layouts/runtime/dynamic-object/relation-tables/table-layout', {body, query: expectedContextQuery()})
    expect(client.post).toHaveBeenCalledWith('/v1/view-layouts/runtime/dynamic-object/records/record%201/relation-tables/line%20items/query', {
      body,
      query: {...expectedContextQuery(), targetFormId: 'target form 1', targetMode: 'VIEW'},
    })
    await cleanup()
  })
})

function expectedContextQuery() {
  return {
    dashboardKey: 'ops',
    draftVersionId: undefined,
    entityId: 'entity 1',
    expand: 'owner,stage',
    formId: 'form 1',
    layoutId: 'layout explicit',
    mode: 'EDIT',
    moduleKey: 'crm module',
    objectKey: 'deal type',
    recordId: 'record 1',
    scopeId: 'scope 1',
    surface: 'DYNAMIC_OBJECT',
    targetFormId: undefined,
    targetMode: undefined,
  }
}

async function createBodyFile(body: unknown) {
  const dir = await mkdtemp(join(tmpdir(), 'opero-view-layouts-body-'))
  const bodyFile = join(dir, 'body.json')
  await writeFile(bodyFile, JSON.stringify(body))

  return {
    bodyFile,
    cleanup: async () => await rm(dir, {force: true, recursive: true}),
  }
}

async function runCommand(
  Command: CommandConstructor,
  client: ReturnType<typeof mockClient>,
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

  return await command.run()
}

function mockClient() {
  return {
    get: vi.fn().mockResolvedValue({data: 'ok'}),
    patch: vi.fn().mockResolvedValue({data: 'ok'}),
    post: vi.fn().mockResolvedValue({data: 'ok'}),
    request: vi.fn().mockResolvedValue({data: 'ok'}),
  }
}
