import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class RulesExecution extends ReadCommand {
  static args = {
    id: Args.string({
      description: 'Rule ID.',
      required: true,
    }),
    execId: Args.string({
      description: 'Rule execution ID.',
      required: true,
    }),
  }

  static description = 'Get one rule execution.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(RulesExecution)
    return this.getJson(apiPath('/v1/rules/{id}/executions/{execId}', args), flags)
  }
}
