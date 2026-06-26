import {readFile} from 'node:fs/promises'
import {describe, expect, it} from 'vitest'

import {parseSkillManifest} from '../src/skills/manifest.js'
import {AGENT_SKILLS_DIR, listAvailableSkills} from '../src/skills/source.js'
import {findReferencedMarkdownFiles, validateSkillFolder} from '../src/skills/validate.js'

const operoCliSkillDir = new URL('opero-cli/', AGENT_SKILLS_DIR)
const operoDictionariesSkillDir = new URL('opero-dictionaries/', AGENT_SKILLS_DIR)
const operoDynamicModulesSkillDir = new URL('opero-dynamic-modules/', AGENT_SKILLS_DIR)
const operoDynamicObjectsSkillDir = new URL('opero-dynamic-objects/', AGENT_SKILLS_DIR)
const operoQueriesSkillDir = new URL('opero-queries/', AGENT_SKILLS_DIR)
const operoRulesSkillDir = new URL('opero-rules/', AGENT_SKILLS_DIR)
const operoScriptsSkillDir = new URL('opero-scripts/', AGENT_SKILLS_DIR)
const operoViewLayoutsSkillDir = new URL('opero-view-layouts/', AGENT_SKILLS_DIR)
const operoWorkflowsSkillDir = new URL('opero-workflows/', AGENT_SKILLS_DIR)

describe('agent skills source', () => {
  it('discovers bundled skills', async () => {
    await expect(listAvailableSkills()).resolves.toEqual([
      expect.objectContaining({name: 'opero-cli'}),
      expect.objectContaining({name: 'opero-dictionaries'}),
      expect.objectContaining({name: 'opero-dynamic-modules'}),
      expect.objectContaining({name: 'opero-dynamic-objects'}),
      expect.objectContaining({name: 'opero-queries'}),
      expect.objectContaining({name: 'opero-rules'}),
      expect.objectContaining({name: 'opero-scripts'}),
      expect.objectContaining({name: 'opero-view-layouts'}),
      expect.objectContaining({name: 'opero-workflows'}),
    ])
  })

  it.each([
    ['opero-cli', operoCliSkillDir],
    ['opero-dictionaries', operoDictionariesSkillDir],
    ['opero-dynamic-modules', operoDynamicModulesSkillDir],
    ['opero-dynamic-objects', operoDynamicObjectsSkillDir],
    ['opero-queries', operoQueriesSkillDir],
    ['opero-rules', operoRulesSkillDir],
    ['opero-scripts', operoScriptsSkillDir],
    ['opero-view-layouts', operoViewLayoutsSkillDir],
    ['opero-workflows', operoWorkflowsSkillDir],
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

  it('references existing bundled reference files for opero-dictionaries', async () => {
    await expect(validateSkillFolder(operoDictionariesSkillDir)).resolves.toBeUndefined()

    const markdown = await readFile(new URL('SKILL.md', operoDictionariesSkillDir), 'utf8')
    expect(findReferencedMarkdownFiles(markdown)).toEqual([
      'references/concepts.md',
      'references/crud.md',
      'references/discovery.md',
      'references/import-export.md',
      'references/payloads.md',
      'references/safety.md',
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

  it('references existing bundled reference files for opero-queries', async () => {
    await expect(validateSkillFolder(operoQueriesSkillDir)).resolves.toBeUndefined()

    const markdown = await readFile(new URL('SKILL.md', operoQueriesSkillDir), 'utf8')
    expect(findReferencedMarkdownFiles(markdown)).toEqual([
      'references/concepts.md',
      'references/lifecycle-and-validation.md',
      'references/parameters.md',
      'references/payloads-and-examples.md',
      'references/schema-discovery.md',
      'references/sql-authoring.md',
    ])
  })

  it('references existing bundled reference files for opero-rules', async () => {
    await expect(validateSkillFolder(operoRulesSkillDir)).resolves.toBeUndefined()

    const markdown = await readFile(new URL('SKILL.md', operoRulesSkillDir), 'utf8')
    expect(findReferencedMarkdownFiles(markdown)).toEqual([
      'references/authoring.md',
      'references/concepts.md',
      'references/context-and-scripts.md',
      'references/discovery.md',
      'references/execution-and-debugging.md',
      'references/impact-and-safety.md',
      'references/payloads.md',
    ])
  })

  it('references existing bundled reference files for opero-dynamic-modules', async () => {
    await expect(validateSkillFolder(operoDynamicModulesSkillDir)).resolves.toBeUndefined()

    const markdown = await readFile(new URL('SKILL.md', operoDynamicModulesSkillDir), 'utf8')
    expect(findReferencedMarkdownFiles(markdown)).toEqual([
      'references/concepts.md',
      'references/delete-safety.md',
      'references/metadata.md',
      'references/payloads.md',
    ])
  })

  it('references existing bundled reference files for opero-dynamic-objects', async () => {
    await expect(validateSkillFolder(operoDynamicObjectsSkillDir)).resolves.toBeUndefined()

    const markdown = await readFile(new URL('SKILL.md', operoDynamicObjectsSkillDir), 'utf8')
    expect(findReferencedMarkdownFiles(markdown)).toEqual([
      'references/concepts.md',
      'references/delete-safety.md',
      'references/discovery.md',
      'references/field-types.md',
      'references/payloads.md',
      'references/records.md',
      'references/relationships.md',
      'references/schema-drafts.md',
    ])
  })

  it('references existing bundled reference files for opero-view-layouts', async () => {
    await expect(validateSkillFolder(operoViewLayoutsSkillDir)).resolves.toBeUndefined()

    const markdown = await readFile(new URL('SKILL.md', operoViewLayoutsSkillDir), 'utf8')
    expect(findReferencedMarkdownFiles(markdown)).toEqual([
      'references/blocks.md',
      'references/custom-fields.md',
      'references/discovery-and-schema.md',
      'references/drafts-validation-publish.md',
      'references/runtime-and-records.md',
      'references/troubleshooting.md',
      'references/workflow.md',
    ])
  })

  it('references existing bundled reference files for opero-workflows', async () => {
    await expect(validateSkillFolder(operoWorkflowsSkillDir)).resolves.toBeUndefined()

    const markdown = await readFile(new URL('SKILL.md', operoWorkflowsSkillDir), 'utf8')
    expect(findReferencedMarkdownFiles(markdown)).toEqual([
      'references/assignments-and-permissions.md',
      'references/concepts.md',
      'references/definition-lifecycle.md',
      'references/payloads.md',
      'references/runtime.md',
      'references/stages-and-transitions.md',
      'references/tasks.md',
    ])
  })

  it.each([
    ['opero-cli', operoCliSkillDir],
    ['opero-dictionaries', operoDictionariesSkillDir],
    ['opero-dynamic-modules', operoDynamicModulesSkillDir],
    ['opero-dynamic-objects', operoDynamicObjectsSkillDir],
    ['opero-queries', operoQueriesSkillDir],
    ['opero-rules', operoRulesSkillDir],
    ['opero-scripts', operoScriptsSkillDir],
    ['opero-view-layouts', operoViewLayoutsSkillDir],
    ['opero-workflows', operoWorkflowsSkillDir],
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
    expect(content).not.toContain('`s d')
    expect(content).not.toContain('search back')
    expect(content).not.toContain('search front')
    expect(content).not.toContain('search docs')
  })
})
