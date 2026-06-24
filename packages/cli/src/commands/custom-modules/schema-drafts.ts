import {BaseCommand} from '../../base-command.js'

export default class CustomModulesSchemaDrafts extends BaseCommand {
  static description = 'Manage custom module schema drafts.'

  async run(): Promise<void> {
    await this.config.runCommand('help', ['custom-modules schema-drafts'])
  }
}
