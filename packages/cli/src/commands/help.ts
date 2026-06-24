import {loadHelpClass} from '@oclif/core'

import {BaseCommand} from '../base-command.js'

export default class HelpCommand extends BaseCommand {
  static description = 'Show full Opero CLI help.'

  async run(): Promise<void> {
    const Help = await loadHelpClass(this.config)
    const help = new Help(this.config, this.config.pjson.oclif.helpOptions ?? this.config.pjson.helpOptions)
    await help.showHelp([])
  }
}
