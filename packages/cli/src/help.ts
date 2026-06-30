import {Help, type Command, type Interfaces} from '@oclif/core'
import pc from 'picocolors'

type Entry = {
  description?: string
  name: string
}

const TOPIC_GROUPS = [
  {
    items: ['auth', 'config', 'doctor', 'health', 'init', 'ping', 'update'],
    title: 'Setup',
  },
  {
    items: ['companies', 'contractors', 'currencies', 'dictionaries', 'service-catalog'],
    title: 'Reference Data',
  },
  {
    items: ['custom-modules', 'custom-objects', 'custom-records', 'custom-scripts', 'queries', 'rules', 'view-layouts'],
    title: 'Custom Data',
  },
  {
    items: ['entity-attachments', 'entity-comments', 'files', 'request'],
    title: 'Files And Entities',
  },
]

export default class OperoHelp extends Help {
  protected formatCommands(commands: Array<Command.Loadable>): string {
    if (commands.length === 0) return ''
    return this.section('Commands', this.renderEntries(commands.map((command) => ({description: this.summary(command), name: configuredId(command.id)}))))
  }

  protected formatRoot(): string {
    const lines = [
      `${pc.bold(pc.cyan('Opero CLI'))} ${pc.dim(`v${this.config.version}`)}`,
      pc.dim('Command-line access to the Opero API.'),
      '',
      `${pc.bold('Usage')}    ${pc.dim('$')} ${pc.cyan(this.config.bin)} ${pc.yellow('<command>')} ${pc.dim('[flags]')}`,
      '',
      pc.bold('Start Here'),
      this.indent(`${pc.cyan('opero help')}                       Show all topics and commands`),
      this.indent(`${pc.cyan('opero init')}                       Configure base URL and API token`),
      this.indent(`${pc.cyan('opero --json doctor')}              Verify config, auth, and API reachability`),
      this.indent(`${pc.cyan('opero --table contractors list')}   Scan data in a readable table`),
      this.indent(`${pc.cyan('opero update')}                     Install the latest standalone release`),
    ]

    return this.opts.stripAnsi ? stripAnsi(lines.join('\n')) : lines.join('\n')
  }

  protected formatTopic(topic: Interfaces.Topic): string {
    const name = configuredId(topic.name)
    const description = topic.description ? this.render(topic.description).split('\n')[0] : ''
    const output = [
      `${pc.bold(pc.cyan(name))}`,
      description ? pc.dim(description) : undefined,
      '',
      `${pc.bold('Usage')}    ${pc.dim('$')} ${pc.cyan(this.config.bin)} ${pc.yellow(`${name} <command>`)} ${pc.dim('[flags]')}`,
    ]
      .filter(Boolean)
      .join('\n')

    return `${this.opts.stripAnsi ? stripAnsi(output) : output}\n`
  }

  protected formatTopics(topics: Interfaces.Topic[]): string {
    if (topics.length === 0) return ''

    const entries = topics.map((topic) => ({
      description: topic.description?.split('\n')[0],
      name: configuredId(topic.name),
    }))
    if (topics.some((topic) => topic.name.includes(':'))) {
      return this.section('Subtopics', this.renderEntries(entries))
    }

    const grouped = this.groupEntries(entries)
    const body = grouped
      .map((group) => [pc.bold(group.title), this.renderEntries(group.items)].filter(Boolean).join('\n'))
      .join('\n\n')

    return this.section('Topics', body)
  }

  protected summary(command: Command.Loadable): string | undefined {
    const value = command.summary ?? command.description
    return value ? pc.dim(this.render(value).split('\n')[0]) : undefined
  }

  private groupEntries(entries: Entry[]): Array<{items: Entry[]; title: string}> {
    const remaining = new Map(entries.map((entry) => [entry.name, entry]))
    const groups: Array<{items: Entry[]; title: string}> = []

    for (const group of TOPIC_GROUPS) {
      const items = group.items.flatMap((name) => {
        const item = remaining.get(name)
        if (!item) return []
        remaining.delete(name)
        return [item]
      })
      if (items.length > 0) groups.push({items, title: group.title})
    }

    const other = [...remaining.values()]
    if (other.length > 0) groups.push({items: other, title: 'Other'})
    return groups
  }

  private renderEntries(entries: Entry[]): string {
    return this.renderList(
      entries.map((entry) => [pc.cyan(entry.name), entry.description ? pc.dim(entry.description) : undefined]),
      {
        indentation: 2,
        spacer: '\n',
        stripAnsi: this.opts.stripAnsi,
      },
    )
  }
}

function configuredId(value: string): string {
  return value.replaceAll(':', ' ')
}

function stripAnsi(value: string): string {
  return value.replaceAll(/\u001B\[[0-?]*[ -/]*[@-~]/g, '')
}
