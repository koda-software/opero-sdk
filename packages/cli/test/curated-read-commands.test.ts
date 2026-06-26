import {describe, expect, it, vi} from 'vitest'

import ContractorsGet from '../src/commands/contractors/get.js'
import ContractorsList from '../src/commands/contractors/list.js'
import CurrenciesList from '../src/commands/currencies/list.js'
import CustomModulesGet from '../src/commands/custom-modules/get.js'
import CustomModulesList from '../src/commands/custom-modules/list.js'
import CustomObjectsFieldTypes from '../src/commands/custom-objects/field-types/index.js'
import CustomObjectsFieldTypesGet from '../src/commands/custom-objects/field-types/get.js'
import CustomObjectsGet from '../src/commands/custom-objects/get.js'
import CustomObjectsList from '../src/commands/custom-objects/list.js'
import CustomRecordsGet from '../src/commands/custom-records/get.js'
import CustomRecordsList from '../src/commands/custom-records/list.js'
import CustomRecordsSingleton from '../src/commands/custom-records/singleton.js'
import DictionariesEntries from '../src/commands/dictionaries/entries/index.js'
import DictionariesGet from '../src/commands/dictionaries/get.js'
import DictionariesList from '../src/commands/dictionaries/list.js'
import WorkflowTemplatesList from '../src/commands/workflow-templates/list.js'
import WorkflowsAssignmentCandidatesLookup from '../src/commands/workflows/assignment-candidates/lookup.js'
import WorkflowsDraftGet from '../src/commands/workflows/draft/get.js'
import WorkflowsGet from '../src/commands/workflows/get.js'
import WorkflowsList from '../src/commands/workflows/list.js'
import WorkflowsPublicationsList from '../src/commands/workflows/publications/list.js'
import WorkflowsRuntimeCreateOptions from '../src/commands/workflows/runtime/create-options.js'
import WorkflowsRuntimeGet from '../src/commands/workflows/runtime/get.js'
import WorkflowsRuntimeHistory from '../src/commands/workflows/runtime/history.js'
import WorkflowsRuntimeReplay from '../src/commands/workflows/runtime/replay.js'
import WorkflowsRuntimeTargetState from '../src/commands/workflows/runtime/target-state.js'
import WorkflowsTasksGet from '../src/commands/workflows/tasks/get.js'
import WorkflowsTasksList from '../src/commands/workflows/tasks/list.js'

type CommandInstance = {
  createApiClient: ReturnType<typeof vi.fn>
  jsonEnabled: ReturnType<typeof vi.fn>
  loadSettings: ReturnType<typeof vi.fn>
  parse: ReturnType<typeof vi.fn>
  printHuman: ReturnType<typeof vi.fn>
  run: () => Promise<unknown>
}

type CommandConstructor = new (argv: string[], config: never) => CommandInstance

type RunOptions = {
  args?: Record<string, string>
  flags?: Record<string, unknown>
}

describe('curated read commands', () => {
  it.each([
    {
      args: {},
      command: CurrenciesList,
      flags: {},
      options: {query: undefined},
      path: '/v1/currencies',
    },
    {
      args: {id: 'contractor 1'},
      command: ContractorsGet,
      flags: {},
      options: {query: undefined},
      path: '/v1/contractors/contractor%201',
    },
    {
      args: {id: 'dictionary 1'},
      command: DictionariesGet,
      flags: {},
      options: {query: undefined},
      path: '/v1/dictionaries/dictionary%201',
    },
    {
      args: {moduleKey: 'crm module'},
      command: CustomModulesGet,
      flags: {},
      options: {query: undefined},
      path: '/v1/custom-modules/crm%20module',
    },
    {
      args: {moduleKey: 'crm module', objectKey: 'deal type'},
      command: CustomObjectsGet,
      flags: {},
      options: {query: undefined},
      path: '/v1/custom-modules/crm%20module/objects/deal%20type',
    },
    {
      args: {},
      command: CustomObjectsFieldTypes,
      flags: {},
      options: {query: undefined},
      path: '/v1/custom-modules/field-types',
    },
    {
      args: {type: 'MULTI SELECT'},
      command: CustomObjectsFieldTypesGet,
      flags: {},
      options: {query: undefined},
      path: '/v1/custom-modules/field-types/MULTI%20SELECT',
    },
    {
      args: {moduleKey: 'crm module', objectKey: 'deal type', recordId: 'record 1'},
      command: CustomRecordsGet,
      flags: {expand: 'owner,stage'},
      options: {query: {expand: 'owner,stage'}},
      path: '/v1/custom-modules/crm%20module/objects/deal%20type/records/record%201',
    },
    {
      args: {moduleKey: 'crm module', objectKey: 'settings'},
      command: CustomRecordsSingleton,
      flags: {expand: 'owner'},
      options: {query: {expand: 'owner'}},
      path: '/v1/custom-modules/crm%20module/objects/settings/record',
    },
    {
      args: {workflowId: 'workflow 1'},
      command: WorkflowsGet,
      flags: {},
      options: {query: undefined},
      path: '/v1/workflows/workflow%201',
    },
    {
      args: {workflowId: 'workflow 1'},
      command: WorkflowsDraftGet,
      flags: {},
      options: {query: undefined},
      path: '/v1/workflows/workflow%201/draft',
    },
    {
      args: {instanceId: 'instance 1'},
      command: WorkflowsRuntimeGet,
      flags: {},
      options: {query: undefined},
      path: '/v1/workflows/runtime/instances/instance%201',
    },
    {
      args: {instanceId: 'instance 1'},
      command: WorkflowsRuntimeReplay,
      flags: {},
      options: {query: undefined},
      path: '/v1/workflows/runtime/instances/instance%201/replay',
    },
    {
      args: {instanceId: 'instance 1'},
      command: WorkflowsRuntimeHistory,
      flags: {},
      options: {query: undefined},
      path: '/v1/workflows/runtime/instances/instance%201/history',
    },
    {
      args: {taskId: 'task 1'},
      command: WorkflowsTasksGet,
      flags: {},
      options: {query: undefined},
      path: '/v1/workflows/tasks/task%201',
    },
  ])('$path', async ({args, command, flags, options, path}) => {
    const {client, result} = await runCommand(command, {args, flags})

    expect(result).toEqual({data: 'ok'})
    expect(client.get).toHaveBeenCalledOnce()
    expect(client.get).toHaveBeenCalledWith(path, options)
  })

  it.each([
    {
      args: {},
      command: ContractorsList,
      path: '/v1/contractors',
    },
    {
      args: {},
      command: DictionariesList,
      path: '/v1/dictionaries',
    },
    {
      args: {dictionaryId: 'dictionary 1'},
      command: DictionariesEntries,
      path: '/v1/dictionaries/dictionary%201/entries',
    },
    {
      args: {},
      command: CustomModulesList,
      path: '/v1/custom-modules',
    },
    {
      args: {moduleKey: 'crm module'},
      command: CustomObjectsList,
      path: '/v1/custom-modules/crm%20module/objects',
    },
    {
      args: {moduleKey: 'crm module', objectKey: 'deal type'},
      command: CustomRecordsList,
      path: '/v1/custom-modules/crm%20module/objects/deal%20type/records',
    },
    {
      args: {},
      command: WorkflowTemplatesList,
      path: '/v1/workflow-templates',
    },
    {
      args: {},
      command: WorkflowsList,
      path: '/v1/workflows',
    },
    {
      args: {workflowId: 'workflow 1'},
      command: WorkflowsPublicationsList,
      path: '/v1/workflows/workflow%201/publications',
    },
    {
      args: {},
      command: WorkflowsTasksList,
      path: '/v1/workflows/tasks',
    },
  ])('$path forwards normalized list query', async ({args, command, path}) => {
    const flags = {
      columns: 'id,name',
      count: 'hasMore',
      expand: 'owner,stage',
      'filter-json': '{"op":"AND","items":[]}',
      limit: 10,
      page: 2,
      'sort-json': '[{"field":"createdAt","direction":"desc"}]',
    }

    const {client, result} = await runCommand(command, {args, flags})

    expect(result).toEqual({data: 'ok'})
    expect(client.get).toHaveBeenCalledOnce()
    expect(client.get).toHaveBeenCalledWith(path, {
      query: {
        columns: '["id","name"]',
        count: 'hasMore',
        ...(command === CustomRecordsList ? {expand: 'owner,stage'} : {}),
        filters: '{"op":"AND","items":[]}',
        limit: 10,
        page: 2,
        sort: '[{"field":"createdAt","direction":"desc"}]',
      },
    })
  })

  it('maps workflow runtime target queries', async () => {
    const {client: createOptionsClient} = await runCommand(WorkflowsRuntimeCreateOptions, {
      flags: {'module-key': 'crm', 'object-key': 'deal', 'target-type': 'DYNAMIC_OBJECT_RECORD'},
    })
    const {client: targetStateClient} = await runCommand(WorkflowsRuntimeTargetState, {
      args: {targetId: 'record 1'},
      flags: {'module-key': 'crm', 'object-key': 'deal', 'target-type': 'DYNAMIC_OBJECT_RECORD'},
    })
    const {client: candidatesClient} = await runCommand(WorkflowsAssignmentCandidatesLookup, {
      flags: {
        'candidate-type': 'membership',
        limit: 5,
        search: 'ada',
        'source-id': 'stage 1',
        'source-type': 'stage',
      },
    })

    expect(createOptionsClient.get).toHaveBeenCalledWith('/v1/workflows/runtime/create-options', {
      query: {moduleKey: 'crm', objectKey: 'deal', targetType: 'DYNAMIC_OBJECT_RECORD'},
    })
    expect(targetStateClient.get).toHaveBeenCalledWith('/v1/workflows/runtime/targets/DYNAMIC_OBJECT_RECORD/record%201', {
      query: {moduleKey: 'crm', objectKey: 'deal'},
    })
    expect(candidatesClient.get).toHaveBeenCalledWith('/v1/workflows/assignment-candidates/lookup', {
      query: {
        candidateType: 'membership',
        limit: 5,
        search: 'ada',
        sourceId: 'stage 1',
        sourceType: 'stage',
      },
    })
  })
})

async function runCommand(Command: CommandConstructor, options: RunOptions) {
  const client = {
    get: vi.fn().mockResolvedValue({data: 'ok'}),
  }

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
  command.printHuman = vi.fn()

  const result = await command.run()
  return {client, command, result}
}
