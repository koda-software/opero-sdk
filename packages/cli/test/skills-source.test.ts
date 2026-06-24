import {readFile} from 'node:fs/promises'
import {describe, expect, it} from 'vitest'

import {parseSkillManifest} from '../src/skills/manifest.js'
import {AGENT_SKILLS_DIR, listAvailableSkills} from '../src/skills/source.js'
import {findReferencedMarkdownFiles, validateSkillFolder} from '../src/skills/validate.js'

const operoCliSkillDir = new URL('opero-cli/', AGENT_SKILLS_DIR)
const operoScriptsSkillDir = new URL('opero-scripts/', AGENT_SKILLS_DIR)

describe('agent skills source', () => {
  it('discovers bundled skills', async () => {
    await expect(listAvailableSkills()).resolves.toEqual([
      expect.objectContaining({name: 'opero-cli'}),
      expect.objectContaining({name: 'opero-scripts'}),
    ])
  })

  it.each([
    ['opero-cli', operoCliSkillDir],
    ['opero-scripts', operoScriptsSkillDir],
  ])('uses portable skill frontmatter for %s compatible with Codex and Claude', async (name, skillDir) => {
    const markdown = await readFile(new URL('SKILL.md', skillDir), 'utf8')
    const manifest = parseSkillManifest(markdown)

    expect(manifest.name).toBe(name)
    expect(manifest.name).toMatch(/^[a-z0-9-]{1,64}$/)
    expect(manifest.description.length).toBeLessThanOrEqual(1024)
    expect(/<[^>]+>/.test(`${manifest.name} ${manifest.description}`)).toBe(false)
  })

  it('references existing bundled reference files', async () => {
    await expect(validateSkillFolder(operoCliSkillDir)).resolves.toBeUndefined()

    const markdown = await readFile(new URL('SKILL.md', operoCliSkillDir), 'utf8')
    expect(findReferencedMarkdownFiles(markdown)).toEqual([
      'references/configuration.md',
      'references/curated-commands.md',
      'references/output-and-errors.md',
      'references/raw-requests.md',
      'references/specialized-skills.md',
      'references/troubleshooting.md',
    ])
  })

  it('references existing bundled reference files for opero-scripts', async () => {
    await expect(validateSkillFolder(operoScriptsSkillDir)).resolves.toBeUndefined()

    const markdown = await readFile(new URL('SKILL.md', operoScriptsSkillDir), 'utf8')
    expect(findReferencedMarkdownFiles(markdown)).toEqual([
      'references/cli-workflows.md',
      'references/concepts.md',
      'references/payloads-and-examples.md',
      'references/rule-scripts.md',
      'references/types-and-context.md',
      'references/validation.md',
    ])
  })

  it.each([
    ['opero-cli', operoCliSkillDir],
    ['opero-scripts', operoScriptsSkillDir],
  ])('does not include platform-specific or local-only install content in %s', async (_name, skillDir) => {
    const files = [
      new URL('SKILL.md', skillDir),
      ...findReferencedMarkdownFiles(await readFile(new URL('SKILL.md', skillDir), 'utf8')).map(
        (reference) => new URL(reference, skillDir),
      ),
    ]
    const content = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n')

    expect(content).not.toContain('agents/openai.yaml')
    expect(content).not.toContain('.codex')
    expect(content).not.toContain('.claude')
    expect(content).not.toContain('`s b')
    expect(content).not.toContain('`s f')
  })
})
