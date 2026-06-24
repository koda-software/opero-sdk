import {afterEach, describe, expect, it, vi} from 'vitest'

import {renderHumanOutput, renderOutput, renderTableOutput} from '../src/output.js'

describe('output rendering', () => {
  afterEach(() => {
    delete process.env.CI
    vi.restoreAllMocks()
  })

  it('renders default human lists as readable summaries', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    renderHumanOutput({
      data: [
        {
          fullName: 'Acme Sp. z o.o.',
          id: 'contractor-1',
          status: 'ACTIVE',
          uniqueId: 'C-1',
        },
      ],
      meta: {
        limit: 1,
        page: 1,
        total: 1,
      },
    })

    const output = stdoutText(log)
    expect(output).toContain('1 item')
    expect(output).toContain('- Acme Sp. z o.o.')
    expect(output).toContain('id: contractor-1')
    expect(output).toContain('limit=1')
    expect(output).toContain('page=1')
    expect(output).toContain('total=1')
  })

  it('renders objects as human key-value output', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    renderHumanOutput({
      data: {
        available: true,
        source: 'config',
      },
    })

    const output = stdoutText(log)
    expect(output).toContain('available: true')
    expect(output).toContain('source: config')
  })

  it('renders arrays as oclif tables', () => {
    process.env.CI = '1'
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    renderTableOutput({
      data: [
        {
          code: 'PLN',
          name: 'Zloty',
        },
      ],
    })

    const output = stdoutText(log)
    expect(output).toContain('Code')
    expect(output).toContain('Name')
    expect(output).toContain('PLN')
    expect(output).toContain('Zloty')
  })

  it('routes --table through table rendering', () => {
    process.env.CI = '1'
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    renderOutput({data: [{code: 'EUR', name: 'Euro'}]}, {table: true})

    const output = stdoutText(log)
    expect(output).toContain('Code')
    expect(output).toContain('EUR')
  })
})

function stdoutText(log: ReturnType<typeof vi.spyOn>): string {
  return log.mock.calls.map((call) => String(call[0])).join('\n')
}
