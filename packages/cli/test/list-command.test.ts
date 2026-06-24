import {describe, expect, it} from 'vitest'

import {OperoCliError} from '../src/api/errors.js'
import {apiPath} from '../src/api/path.js'
import {ListCommand} from '../src/list-command.js'

class TestListCommand extends ListCommand {
  async run(): Promise<void> {}

  public query(flags: Parameters<ListCommand['buildListQuery']>[0], extra = {}) {
    return this.buildListQuery(flags, extra)
  }
}

describe('apiPath', () => {
  it('encodes path values', () => {
    expect(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}', {moduleKey: 'crm', objectKey: 'deal type'})).toBe(
      '/v1/custom-modules/crm/objects/deal%20type',
    )
  })
})

describe('ListCommand', () => {
  const command = new TestListCommand([], {} as never)

  it('builds list query parameters', () => {
    expect(
      command.query({
        columns: 'id,name',
        count: 'hasMore',
        'filter-json': '{"op":"AND","items":[]}',
        limit: 10,
        page: 2,
        'sort-json': '[{"field":"createdAt","direction":"desc"}]',
      }),
    ).toEqual({
      columns: '["id","name"]',
      count: 'hasMore',
      filters: '{"op":"AND","items":[]}',
      limit: 10,
      page: 2,
      sort: '[{"field":"createdAt","direction":"desc"}]',
    })
  })

  it('rejects invalid JSON flags', () => {
    expect(() => command.query({'filter-json': '{'})).toThrow(OperoCliError)
  })
})
