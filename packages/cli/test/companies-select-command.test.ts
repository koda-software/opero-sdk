import {mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it, vi} from 'vitest'

import CompaniesSelect from '../src/commands/companies/select.js'

type CommandInstance = InstanceType<typeof CompaniesSelect> & {
  jsonEnabled: ReturnType<typeof vi.fn>
  loadSettings: ReturnType<typeof vi.fn>
  parse: ReturnType<typeof vi.fn>
}

describe('companies select command', () => {
  it('saves the selected company id without calling the API', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-company-select-'))
    const configPath = join(dir, 'config.json')
    const command = new CompaniesSelect([], {} as never) as CommandInstance
    Object.defineProperty(command, 'configPath', {get: () => configPath})
    command.parse = vi.fn().mockResolvedValue({
      args: {companyId: 'company-1'},
      flags: {},
    })
    command.loadSettings = vi.fn().mockResolvedValue({
      config: {
        apiToken: 'test-token',
        baseUrl: 'https://api.example',
      },
      settings: {
        apiToken: 'test-token',
        authSource: 'config',
        baseUrl: 'https://api.example',
        timeoutMs: 30_000,
      },
    })
    command.jsonEnabled = vi.fn().mockReturnValue(true)

    const result = await command.run()

    expect(result).toEqual({
      data: {
        companyId: 'company-1',
        configPath,
        selected: true,
      },
    })
    expect(JSON.parse(await readFile(configPath, 'utf8'))).toEqual({
      apiToken: 'test-token',
      baseUrl: 'https://api.example',
      companyId: 'company-1',
    })
    await rm(dir, {force: true, recursive: true})
  })
})
