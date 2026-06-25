import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {describe, expect, it} from 'vitest'

describe('standalone packaging', () => {
  it('copies bundled agent skills into the standalone package root', async () => {
    const script = await readFile(resolve(import.meta.dirname, '../../../scripts/pack-standalone.mjs'), 'utf8')

    expect(script).toContain("resolve(cliRoot, 'agent-skills')")
    expect(script).toContain("resolve(packRoot, 'agent-skills')")
  })
})
