import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class RulesExecute extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Rule ID.',
      required: true,
    }),
  }

  static description = 'Execute a manual automation rule.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(RulesExecute)
    return this.postJson(apiPath('/v1/rules/{id}/execute', args), flags)
  }
}
