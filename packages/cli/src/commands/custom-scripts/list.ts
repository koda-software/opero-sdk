import {Flags} from '@oclif/core'

import {listFlags, ListCommand} from '../../list-command.js'

export default class CustomScriptsList extends ListCommand {
  static description = 'List custom scripts.'
  static enableJsonFlag = true
  static flags = {
    ...listFlags,
    'execution-mode': Flags.string({
      description: 'Execution mode filter.',
    }),
    'include-archived': Flags.boolean({
      description: 'Include archived scripts.',
    }),
    status: Flags.string({
      description: 'Script status filter.',
    }),
    type: Flags.string({
      description: 'Script type filter.',
    }),
    'validation-status': Flags.string({
      description: 'Validation status filter.',
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(CustomScriptsList)
    return this.getList('/v1/custom-scripts', flags, {
      executionMode: flags['execution-mode'],
      includeArchived: flags['include-archived'],
      status: flags.status,
      type: flags.type,
      validationStatus: flags['validation-status'],
    })
  }
}
