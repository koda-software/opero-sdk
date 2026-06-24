import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class RulesDelete extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Rule ID.',
      required: true,
    }),
  }

  static description = 'Delete an automation rule immediately.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(RulesDelete)
    return this.deleteJson(apiPath('/v1/rules/{id}', args), flags)
  }
}
