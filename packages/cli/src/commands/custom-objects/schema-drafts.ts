import {BaseCommand} from '../../base-command.js'

export default class CustomObjectsSchemaDrafts extends BaseCommand {
  static description = 'Manage custom object schema drafts.'

  async run(): Promise<void> {
    await this.config.runCommand('help', ['custom-objects schema-drafts'])
  }
}
