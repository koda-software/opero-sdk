import {readdir, readFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'

import {parseSkillManifest, type SkillManifest} from './manifest.js'

export type AvailableSkill = SkillManifest & {
  path: string
}

export const AGENT_SKILLS_DIR = new URL('../../agent-skills/', import.meta.url)

export async function listAvailableSkills(skillsDir = AGENT_SKILLS_DIR): Promise<AvailableSkill[]> {
  const entries = await readdir(skillsDir, {withFileTypes: true})
  const skills = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const skillDir = new URL(`${entry.name}/`, skillsDir)
        const skillMarkdown = await readFile(new URL('SKILL.md', skillDir), 'utf8')
        const manifest = parseSkillManifest(skillMarkdown)
        if (manifest.name !== entry.name) {
          throw new Error(`Skill folder ${entry.name} does not match frontmatter name ${manifest.name}`)
        }

        return {
          ...manifest,
          path: fileUrlPath(skillDir),
        }
      }),
  )

  return skills.sort((left, right) => left.name.localeCompare(right.name))
}

function fileUrlPath(url: URL): string {
  return fileURLToPath(url).replace(/\/$/, '')
}
