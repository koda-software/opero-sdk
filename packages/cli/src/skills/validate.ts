import {access, readFile} from 'node:fs/promises'

import {parseSkillManifest} from './manifest.js'

export async function validateSkillFolder(skillDir: URL): Promise<void> {
  const skillMarkdown = await readFile(new URL('SKILL.md', skillDir), 'utf8')
  const manifest = parseSkillManifest(skillMarkdown)
  const folderName = skillDir.pathname.replace(/\/$/, '').split('/').at(-1)
  if (folderName && manifest.name !== decodeURIComponent(folderName)) {
    throw new Error(`Skill folder ${folderName} does not match frontmatter name ${manifest.name}`)
  }

  for (const reference of findReferencedMarkdownFiles(skillMarkdown)) {
    await access(new URL(reference, skillDir))
  }
}

export function findReferencedMarkdownFiles(markdown: string): string[] {
  const references = new Set<string>()
  const pattern = /`(references\/[a-z0-9-]+\.md)`/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(markdown))) {
    references.add(match[1])
  }

  return [...references].sort()
}
