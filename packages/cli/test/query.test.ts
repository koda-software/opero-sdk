import {describe, expect, it} from 'vitest'

import {parseHeaderPairs} from '../src/api/headers.js'
import {OperoCliError} from '../src/api/errors.js'
import {parseQueryPairs} from '../src/api/query.js'

describe('parseQueryPairs', () => {
  it('parses repeated key-value pairs', () => {
    expect(parseQueryPairs(['limit=10', 'tag=a', 'tag=b'])).toEqual({
      limit: '10',
      tag: ['a', 'b'],
    })
  })

  it('rejects invalid pairs', () => {
    expect(() => parseQueryPairs(['missing-equals'])).toThrow(OperoCliError)
  })
})

describe('parseHeaderPairs', () => {
  it('parses headers', () => {
    expect(parseHeaderPairs(['X-Test=yes'])).toEqual({'X-Test': 'yes'})
  })

  it('rejects manual authorization headers', () => {
    expect(() => parseHeaderPairs(['Authorization=Bearer token'])).toThrow(OperoCliError)
  })
})
