import {describe, expect, it, vi} from 'vitest'

import SkillsList from '../src/commands/skills/list.js'

describe('skills list command', () => {
  it('returns bundled skills', async () => {
    const command = new SkillsList([], {} as never)
    command.parse = vi.fn().mockResolvedValue({args: {}, flags: {}})
    command.jsonEnabled = vi.fn().mockReturnValue(true)
    command.printOutput = vi.fn()

    const result = await command.run()

    expect(result.data).toEqual([
      expect.objectContaining({
        description: expect.stringContaining('Opero CLI'),
        name: 'opero-cli',
      }),
      expect.objectContaining({
        description: expect.stringContaining('saved SQL queries'),
        name: 'opero-queries',
      }),
      expect.objectContaining({
        description: expect.stringContaining('custom scripts'),
        name: 'opero-scripts',
      }),
    ])
    expect(command.printOutput).not.toHaveBeenCalled()
  })
})
