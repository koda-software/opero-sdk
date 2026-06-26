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
        description: expect.stringContaining('dictionaries'),
        name: 'opero-dictionaries',
      }),
      expect.objectContaining({
        description: expect.stringContaining('dynamic/custom modules'),
        name: 'opero-dynamic-modules',
      }),
      expect.objectContaining({
        description: expect.stringContaining('dynamic/custom objects'),
        name: 'opero-dynamic-objects',
      }),
      expect.objectContaining({
        description: expect.stringContaining('saved SQL queries'),
        name: 'opero-queries',
      }),
      expect.objectContaining({
        description: expect.stringContaining('automation rules'),
        name: 'opero-rules',
      }),
      expect.objectContaining({
        description: expect.stringContaining('custom scripts'),
        name: 'opero-scripts',
      }),
      expect.objectContaining({
        description: expect.stringContaining('View Layouts'),
        name: 'opero-view-layouts',
      }),
      expect.objectContaining({
        description: expect.stringContaining('workflows'),
        name: 'opero-workflows',
      }),
    ])
    expect(command.printOutput).not.toHaveBeenCalled()
  })
})
