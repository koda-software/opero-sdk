import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class RulesUpdate extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Rule ID.',
      required: true,
    }),
  }

  static description = 'Update an automation rule.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(RulesUpdate)
    return this.patchJson(apiPath('/v1/rules/{id}', args), flags)
  }
}
