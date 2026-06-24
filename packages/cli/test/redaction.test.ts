import {describe, expect, it} from 'vitest'

import {redactText, redactToken} from '../src/api/redaction.js'

describe('redaction', () => {
  it('redacts tokens for display', () => {
    expect(redactToken('ek_1234567890abcdef')).toBe('ek_1...cdef')
  })

  it('redacts bearer headers and Opero tokens in text', () => {
    expect(redactText('Authorization: Bearer ek_1234567890abcdef')).toBe('Authorization: Bearer [REDACTED]')
  })
})
