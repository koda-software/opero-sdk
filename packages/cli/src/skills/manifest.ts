export type SkillManifest = {
  description: string
  name: string
}

export function parseSkillManifest(markdown: string): SkillManifest {
  const match = /^---\n(?<frontmatter>[\s\S]*?)\n---/.exec(markdown)
  if (!match?.groups?.frontmatter) {
    throw new Error('SKILL.md must start with YAML frontmatter')
  }

  const entries = match.groups.frontmatter
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(':')
      if (separator <= 0) throw new Error(`Invalid frontmatter line: ${line}`)
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()] as const
    })

  const fields = Object.fromEntries(entries)
  return validateSkillManifest(fields)
}

export function validateSkillManifest(fields: Record<string, string>): SkillManifest {
  const keys = Object.keys(fields)
  const unexpected = keys.filter((key) => !['description', 'name'].includes(key))
  if (unexpected.length > 0) {
    throw new Error(`Unsupported skill frontmatter field: ${unexpected.join(', ')}`)
  }

  const name = fields.name
  const description = fields.description
  if (!name) throw new Error('Skill frontmatter must include name')
  if (!description) throw new Error('Skill frontmatter must include description')
  if (!/^[a-z0-9-]{1,64}$/.test(name)) {
    throw new Error('Skill name must use lowercase letters, numbers, and hyphens, up to 64 characters')
  }

  if (description.length > 1024) {
    throw new Error('Skill description must be 1024 characters or less')
  }

  if (/<[^>]+>/.test(`${name} ${description}`)) {
    throw new Error('Skill metadata must not contain XML-like tags')
  }

  return {description, name}
}
