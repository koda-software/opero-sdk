import {BaseCommand} from '../../base-command.js'

export default class SkillsInstall extends BaseCommand {
  static description = 'Install bundled Opero agent skills.'

  async run(): Promise<void> {
    await this.parse(SkillsInstall)
    this.log('Install bundled Opero agent skills for:')
    this.log('')
    this.log('  opero skills install codex   Install skills for Codex')
    this.log('  opero skills install claude  Install skills for Claude')
    this.log('')
    this.log('Options:')
    this.log('  --scope user|repo     Install for the current user or the current Git repo')
    this.log('  --target-dir <path>   Install into an explicit directory')
    this.log('  --dry-run             Show what would be installed')
    this.log('  --force               Overwrite unmanaged skill folders')
  }
}
