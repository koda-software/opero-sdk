import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it, vi} from 'vitest'

import ContractorsCreate from '../src/commands/contractors/create.js'
import ContractorsUpdate from '../src/commands/contractors/update.js'
import ContractorsUpdateStatus from '../src/commands/contractors/update-status.js'
import CustomModulesCreate from '../src/commands/custom-modules/create.js'
import CustomModulesDelete from '../src/commands/custom-modules/delete.js'
import CustomModulesDeleteImpact from '../src/commands/custom-modules/delete-impact.js'
import CustomModulesSchema from '../src/commands/custom-modules/schema.js'
import CustomModulesUpdate from '../src/commands/custom-modules/update.js'
import CustomObjectsDelete from '../src/commands/custom-objects/delete.js'
import CustomObjectsDeleteImpact from '../src/commands/custom-objects/delete-impact.js'
import CustomObjectsFieldTypes from '../src/commands/custom-objects/field-types/index.js'
import CustomObjectsFieldTypesGet from '../src/commands/custom-objects/field-types/get.js'
import CustomObjectsSchemaDraftsApply from '../src/commands/custom-objects/schema-drafts/apply.js'
import CustomObjectsSchemaDraftsCreate from '../src/commands/custom-objects/schema-drafts/create.js'
import CustomObjectsSchemaDraftsDelete from '../src/commands/custom-objects/schema-drafts/delete.js'
import CustomObjectsSchemaDraftsGet from '../src/commands/custom-objects/schema-drafts/get.js'
import CustomObjectsSchemaDraftsList from '../src/commands/custom-objects/schema-drafts/list.js'
import CustomObjectsSchemaDraftsUpdate from '../src/commands/custom-objects/schema-drafts/update.js'
import CustomObjectsSchemaDraftsValidate from '../src/commands/custom-objects/schema-drafts/validate.js'
import CustomObjectsSchema from '../src/commands/custom-objects/schema.js'
import CustomRecordsCreate from '../src/commands/custom-records/create.js'
import CustomRecordsDelete from '../src/commands/custom-records/delete.js'
import CustomRecordsUpdate from '../src/commands/custom-records/update.js'
import CustomRecordsUpdateSingleton from '../src/commands/custom-records/update-singleton.js'
import CustomScriptsArchive from '../src/commands/custom-scripts/archive.js'
import CustomScriptsCreate from '../src/commands/custom-scripts/create.js'
import CustomScriptsDelete from '../src/commands/custom-scripts/delete.js'
import CustomScriptsGet from '../src/commands/custom-scripts/get.js'
import CustomScriptsList from '../src/commands/custom-scripts/list.js'
import CustomScriptsRestore from '../src/commands/custom-scripts/restore.js'
import CustomScriptsUpdate from '../src/commands/custom-scripts/update.js'
import QueriesCreate from '../src/commands/queries/create.js'
import QueriesDelete from '../src/commands/queries/delete.js'
import QueriesExecute from '../src/commands/queries/execute.js'
import QueriesGet from '../src/commands/queries/get.js'
import QueriesList from '../src/commands/queries/list.js'
import QueriesSchema from '../src/commands/queries/schema.js'
import QueriesUpdate from '../src/commands/queries/update.js'
import QueriesValidate from '../src/commands/queries/validate.js'
import RulesConfig from '../src/commands/rules/config.js'
import RulesContextSchema from '../src/commands/rules/context-schema.js'
import RulesContextSchemas from '../src/commands/rules/context-schemas.js'
import RulesCreate from '../src/commands/rules/create.js'
import RulesDelete from '../src/commands/rules/delete.js'
import RulesEntityFields from '../src/commands/rules/entity-fields.js'
import RulesExecution from '../src/commands/rules/execution.js'
import RulesExecutions from '../src/commands/rules/executions.js'
import RulesExecute from '../src/commands/rules/execute.js'
import RulesGet from '../src/commands/rules/get.js'
import RulesList from '../src/commands/rules/list.js'
import RulesRelatedCustomField from '../src/commands/rules/related-custom-field.js'
import RulesRelatedCustomModule from '../src/commands/rules/related-custom-module.js'
import RulesRelatedCustomObject from '../src/commands/rules/related-custom-object.js'
import RulesStepTypes from '../src/commands/rules/step-types.js'
import RulesUpdate from '../src/commands/rules/update.js'
import RulesValidateScript from '../src/commands/rules/validate-script.js'

type CommandInstance = {
  createApiClient: ReturnType<typeof vi.fn>
  jsonEnabled: ReturnType<typeof vi.fn>
  loadSettings: ReturnType<typeof vi.fn>
  parse: ReturnType<typeof vi.fn>
  printOutput: ReturnType<typeof vi.fn>
  run: () => Promise<unknown>
}

type CommandConstructor = new (argv: string[], config: never) => CommandInstance

describe('rules commands', () => {
  it.each([
    {
      command: RulesConfig,
      expected: ['/v1/rules/config', {query: undefined}],
      name: 'config',
      options: {},
    },
    {
      command: RulesStepTypes,
      expected: [
        '/v1/rules/step-types',
        {query: {category: 'action', limit: 10, page: 2, search: 'mail'}},
      ],
      name: 'step types',
      options: {flags: {category: 'action', limit: 10, page: 2, search: 'mail'}},
    },
    {
      command: RulesEntityFields,
      expected: [
        '/v1/rules/entity-fields',
        {query: {entityType: 'custom_record', moduleKey: 'crm', objectKey: 'deal'}},
      ],
      name: 'entity fields',
      options: {flags: {'entity-type': 'custom_record', 'module-key': 'crm', 'object-key': 'deal'}},
    },
    {
      command: RulesGet,
      expected: ['/v1/rules/rule%201', {query: undefined}],
      name: 'get',
      options: {args: {id: 'rule 1'}},
    },
    {
      command: RulesList,
      expected: ['/v1/rules', {query: {columns: '["id","name"]', limit: 10, page: 2}}],
      name: 'list',
      options: {flags: {columns: 'id,name', limit: 10, page: 2}},
    },
    {
      command: RulesExecutions,
      expected: ['/v1/rules/rule%201/executions', {query: {limit: 5}}],
      name: 'executions',
      options: {args: {id: 'rule 1'}, flags: {limit: 5}},
    },
    {
      command: RulesExecution,
      expected: ['/v1/rules/rule%201/executions/exec%201', {query: undefined}],
      name: 'execution',
      options: {args: {execId: 'exec 1', id: 'rule 1'}},
    },
    {
      command: RulesContextSchema,
      expected: ['/v1/rules/rule%201/context-schema', {query: {stepPosition: 3}}],
      name: 'context schema',
      options: {args: {id: 'rule 1'}, flags: {'step-position': 3}},
    },
    {
      command: RulesRelatedCustomObject,
      expected: ['/v1/rules/related/custom-objects/crm/deal%20type', {query: {limit: 5}}],
      name: 'related custom object',
      options: {args: {moduleKey: 'crm', objectKey: 'deal type'}, flags: {limit: 5}},
    },
    {
      command: RulesRelatedCustomField,
      expected: ['/v1/rules/related/custom-fields/field%201', {query: {limit: 5}}],
      name: 'related custom field',
      options: {args: {fieldDefinitionId: 'field 1'}, flags: {limit: 5}},
    },
    {
      command: RulesRelatedCustomModule,
      expected: ['/v1/rules/related/custom-modules/crm', {query: {limit: 5}}],
      name: 'related custom module',
      options: {args: {moduleKey: 'crm'}, flags: {limit: 5}},
    },
  ])('maps $name GET request', async ({command, expected, options}) => {
    const client = mockClient()

    await runCommand(command, client, options)

    expect(client.get).toHaveBeenCalledWith(...expected)
  })

  it('maps rule write requests from body files', async () => {
    const {bodyFile, cleanup} = await createBodyFile({name: 'Rule'})
    const client = mockClient()

    await runCommand(RulesCreate, client, {flags: {'body-file': bodyFile}})
    await runCommand(RulesUpdate, client, {args: {id: 'rule 1'}, flags: {'body-file': bodyFile}})
    await runCommand(RulesExecute, client, {args: {id: 'rule 1'}, flags: {'body-file': bodyFile}})
    await runCommand(RulesContextSchemas, client, {flags: {'body-file': bodyFile}})
    await runCommand(RulesValidateScript, client, {flags: {'body-file': bodyFile}})
    await runCommand(RulesDelete, client, {args: {id: 'rule 1'}})

    expect(client.post).toHaveBeenCalledWith('/v1/rules', {body: {name: 'Rule'}})
    expect(client.patch).toHaveBeenCalledWith('/v1/rules/rule%201', {body: {name: 'Rule'}})
    expect(client.post).toHaveBeenCalledWith('/v1/rules/rule%201/execute', {body: {name: 'Rule'}})
    expect(client.post).toHaveBeenCalledWith('/v1/rules/context-schemas', {body: {name: 'Rule'}})
    expect(client.post).toHaveBeenCalledWith('/v1/rules/validate-script', {body: {name: 'Rule'}})
    expect(client.delete).toHaveBeenCalledWith('/v1/rules/rule%201')
    await cleanup()
  })
})

describe('queries commands', () => {
  it('maps saved query read requests', async () => {
    const client = mockClient()

    await runCommand(QueriesList, client, {
      flags: {
        columns: 'id,key,name',
        count: 'hasMore',
        'filter-json': '{"op":"AND","items":[]}',
        limit: 10,
        page: 2,
        scope: 'ORGANIZATION',
        'sort-json': '[{"field":"createdAt","direction":"desc"}]',
      },
    })
    await runCommand(QueriesGet, client, {args: {id: 'query 1'}})
    await runCommand(QueriesSchema, client, {})

    expect(client.get).toHaveBeenCalledWith('/v1/saved-queries', {
      query: {
        columns: '["id","key","name"]',
        count: 'hasMore',
        filters: '{"op":"AND","items":[]}',
        limit: 10,
        page: 2,
        scope: 'ORGANIZATION',
        sort: '[{"field":"createdAt","direction":"desc"}]',
      },
    })
    expect(client.get).toHaveBeenCalledWith('/v1/saved-queries/query%201', {query: undefined})
    expect(client.get).toHaveBeenCalledWith('/v1/saved-queries/schema', {query: undefined})
  })

  it('maps saved query write requests from body files', async () => {
    const {bodyFile, cleanup} = await createBodyFile({
      key: 'active-assets',
      name: 'Active assets',
      parameters: [{name: 'ownerId', required: false, type: 'uuid'}],
      sql: 'select id from runtime_dyn."dyn_assets" where owner_id = :ownerId',
    })
    const client = mockClient()

    await runCommand(QueriesValidate, client, {flags: {'body-file': bodyFile}})
    await runCommand(QueriesCreate, client, {flags: {'body-file': bodyFile}})
    await runCommand(QueriesUpdate, client, {args: {id: 'query 1'}, flags: {'body-file': bodyFile}})
    await runCommand(QueriesExecute, client, {args: {id: 'query 1'}, flags: {'body-file': bodyFile}})
    await runCommand(QueriesDelete, client, {args: {id: 'query 1'}})

    const body = {
      key: 'active-assets',
      name: 'Active assets',
      parameters: [{name: 'ownerId', required: false, type: 'uuid'}],
      sql: 'select id from runtime_dyn."dyn_assets" where owner_id = :ownerId',
    }
    expect(client.post).toHaveBeenCalledWith('/v1/saved-queries/validate', {body})
    expect(client.post).toHaveBeenCalledWith('/v1/saved-queries', {body})
    expect(client.patch).toHaveBeenCalledWith('/v1/saved-queries/query%201', {body})
    expect(client.post).toHaveBeenCalledWith('/v1/saved-queries/query%201/execute', {body})
    expect(client.delete).toHaveBeenCalledWith('/v1/saved-queries/query%201')
    await cleanup()
  })
})

describe('custom data write commands', () => {
  it('maps contractor write requests from body files', async () => {
    const {bodyFile, cleanup} = await createBodyFile({status: 'ACTIVE'})
    const client = mockClient()

    await runCommand(ContractorsCreate, client, {flags: {'body-file': bodyFile}})
    await runCommand(ContractorsUpdate, client, {args: {id: 'contractor 1'}, flags: {'body-file': bodyFile}})
    await runCommand(ContractorsUpdateStatus, client, {args: {id: 'contractor 1'}, flags: {'body-file': bodyFile}})

    expect(client.post).toHaveBeenCalledWith('/v1/contractors', {body: {status: 'ACTIVE'}})
    expect(client.patch).toHaveBeenCalledWith('/v1/contractors/contractor%201', {body: {status: 'ACTIVE'}})
    expect(client.patch).toHaveBeenCalledWith('/v1/contractors/contractor%201/status', {body: {status: 'ACTIVE'}})
    await cleanup()
  })

  it('maps custom module metadata and schema context commands', async () => {
    const {bodyFile, cleanup} = await createBodyFile({name: 'CRM'})
    const client = mockClient()

    await runCommand(CustomModulesCreate, client, {flags: {'body-file': bodyFile}})
    await runCommand(CustomModulesUpdate, client, {args: {moduleKey: 'crm module'}, flags: {'body-file': bodyFile}})
    await runCommand(CustomModulesDeleteImpact, client, {args: {moduleKey: 'crm module'}})
    await runCommand(CustomModulesSchema, client, {args: {moduleKey: 'crm module'}})
    await runCommand(CustomModulesDelete, client, {args: {moduleKey: 'crm module'}})

    expect(client.post).toHaveBeenCalledWith('/v1/custom-modules', {body: {name: 'CRM'}})
    expect(client.patch).toHaveBeenCalledWith('/v1/custom-modules/crm%20module', {body: {name: 'CRM'}})
    expect(client.get).toHaveBeenCalledWith('/v1/custom-modules/crm%20module/delete-impact', {query: undefined})
    expect(client.get).toHaveBeenCalledWith('/v1/custom-modules/crm%20module/schema', {query: undefined})
    expect(client.delete).toHaveBeenCalledWith('/v1/custom-modules/crm%20module', {query: {confirmModuleKey: 'crm module'}})
    await cleanup()
  })

  it('maps custom object schema, draft, and delete commands', async () => {
    const {bodyFile, cleanup} = await createBodyFile({clientMutationId: 'object-change-1'})
    const client = mockClient()
    const args = {draftId: 'draft 1', moduleKey: 'crm module', objectKey: 'deal type'}

    await runCommand(CustomObjectsSchema, client, {args, flags: {mode: 'edit'}})
    await runCommand(CustomObjectsFieldTypes, client, {})
    await runCommand(CustomObjectsFieldTypesGet, client, {args: {type: 'SELECT'}})
    await runCommand(CustomObjectsDeleteImpact, client, {args})
    await runCommand(CustomObjectsSchemaDraftsList, client, {args})
    await runCommand(CustomObjectsSchemaDraftsGet, client, {args})
    await runCommand(CustomObjectsSchemaDraftsCreate, client, {args, flags: {'body-file': bodyFile}})
    await runCommand(CustomObjectsSchemaDraftsUpdate, client, {args, flags: {'body-file': bodyFile}})
    await runCommand(CustomObjectsSchemaDraftsValidate, client, {args})
    await runCommand(CustomObjectsSchemaDraftsApply, client, {args, flags: {'body-file': bodyFile}})
    await runCommand(CustomObjectsSchemaDraftsDelete, client, {args})
    await runCommand(CustomObjectsDelete, client, {args, flags: {'body-file': bodyFile}})

    const base = '/v1/custom-modules/crm%20module/objects/deal%20type'
    expect(client.get).toHaveBeenCalledWith(`${base}/schema`, {query: {mode: 'edit'}})
    expect(client.get).toHaveBeenCalledWith('/v1/custom-modules/field-types', {query: undefined})
    expect(client.get).toHaveBeenCalledWith('/v1/custom-modules/field-types/SELECT', {query: undefined})
    expect(client.get).toHaveBeenCalledWith(`${base}/delete-impact`, {query: undefined})
    expect(client.get).toHaveBeenCalledWith(`${base}/schema/drafts`, {query: undefined})
    expect(client.get).toHaveBeenCalledWith(`${base}/schema/drafts/draft%201`, {query: undefined})
    expect(client.post).toHaveBeenCalledWith(`${base}/schema/drafts`, {body: {clientMutationId: 'object-change-1'}})
    expect(client.patch).toHaveBeenCalledWith(`${base}/schema/drafts/draft%201`, {body: {clientMutationId: 'object-change-1'}})
    expect(client.post).toHaveBeenCalledWith(`${base}/schema/drafts/draft%201/validate`)
    expect(client.post).toHaveBeenCalledWith(`${base}/schema/drafts/draft%201/apply`, {body: {clientMutationId: 'object-change-1'}})
    expect(client.delete).toHaveBeenCalledWith(`${base}/schema/drafts/draft%201`)
    expect(client.post).toHaveBeenCalledWith(`${base}/delete`, {body: {clientMutationId: 'object-change-1'}})
    await cleanup()
  })

  it('maps custom record write commands', async () => {
    const {bodyFile, cleanup} = await createBodyFile({fields: {name: 'Deal'}})
    const client = mockClient()
    const args = {moduleKey: 'crm module', objectKey: 'deal type', recordId: 'record 1'}

    await runCommand(CustomRecordsCreate, client, {args, flags: {'body-file': bodyFile}})
    await runCommand(CustomRecordsUpdate, client, {args, flags: {'body-file': bodyFile}})
    await runCommand(CustomRecordsUpdateSingleton, client, {args, flags: {'body-file': bodyFile}})
    await runCommand(CustomRecordsDelete, client, {args})

    const base = '/v1/custom-modules/crm%20module/objects/deal%20type'
    expect(client.post).toHaveBeenCalledWith(`${base}/records`, {body: {fields: {name: 'Deal'}}})
    expect(client.patch).toHaveBeenCalledWith(`${base}/records/record%201`, {body: {fields: {name: 'Deal'}}})
    expect(client.patch).toHaveBeenCalledWith(`${base}/record`, {body: {fields: {name: 'Deal'}}})
    expect(client.delete).toHaveBeenCalledWith(`${base}/records/record%201`)
    await cleanup()
  })

  it('maps custom script commands', async () => {
    const {bodyFile, cleanup} = await createBodyFile({name: 'Sync script'})
    const client = mockClient()

    await runCommand(CustomScriptsList, client, {
      flags: {
        'execution-mode': 'SYNC',
        'include-archived': true,
        limit: 10,
        status: 'ACTIVE',
        type: 'RULE_STEP',
        'validation-status': 'VALID',
      },
    })
    await runCommand(CustomScriptsGet, client, {args: {id: 'script 1'}})
    await runCommand(CustomScriptsCreate, client, {flags: {'body-file': bodyFile}})
    await runCommand(CustomScriptsUpdate, client, {args: {id: 'script 1'}, flags: {'body-file': bodyFile}})
    await runCommand(CustomScriptsArchive, client, {args: {id: 'script 1'}})
    await runCommand(CustomScriptsRestore, client, {args: {id: 'script 1'}})
    await runCommand(CustomScriptsDelete, client, {args: {id: 'script 1'}})

    expect(client.get).toHaveBeenCalledWith('/v1/custom-scripts', {
      query: {
        executionMode: 'SYNC',
        includeArchived: true,
        limit: 10,
        status: 'ACTIVE',
        type: 'RULE_STEP',
        validationStatus: 'VALID',
      },
    })
    expect(client.get).toHaveBeenCalledWith('/v1/custom-scripts/script%201', {query: undefined})
    expect(client.post).toHaveBeenCalledWith('/v1/custom-scripts', {body: {name: 'Sync script'}})
    expect(client.patch).toHaveBeenCalledWith('/v1/custom-scripts/script%201', {body: {name: 'Sync script'}})
    expect(client.patch).toHaveBeenCalledWith('/v1/custom-scripts/script%201/archive')
    expect(client.patch).toHaveBeenCalledWith('/v1/custom-scripts/script%201/restore')
    expect(client.delete).toHaveBeenCalledWith('/v1/custom-scripts/script%201')
    await cleanup()
  })
})

async function createBodyFile(body: unknown) {
  const dir = await mkdtemp(join(tmpdir(), 'opero-body-'))
  const bodyFile = join(dir, 'body.json')
  await writeFile(bodyFile, JSON.stringify(body))

  return {
    bodyFile,
    cleanup: async () => await rm(dir, {force: true, recursive: true}),
  }
}

async function runCommand(Command: CommandConstructor, client: ReturnType<typeof mockClient>, options: {args?: Record<string, string>; flags?: Record<string, unknown>} = {}) {
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
    delete: vi.fn().mockResolvedValue({data: null}),
    get: vi.fn().mockResolvedValue({data: 'ok'}),
    patch: vi.fn().mockResolvedValue({data: 'ok'}),
    post: vi.fn().mockResolvedValue({data: 'ok'}),
  }
}
