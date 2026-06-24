import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class RulesGet extends ReadCommand {
  static args = {
    id: Args.string({
      description: 'Rule ID.',
      required: true,
    }),
  }

  static description = 'Get one automation rule.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(RulesGet)
    return this.getJson(apiPath('/v1/rules/{id}', args), flags)
  }
}
