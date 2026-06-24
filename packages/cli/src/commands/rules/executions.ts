import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {listFlags, ListCommand} from '../../list-command.js'

export default class RulesExecutions extends ListCommand {
  static args = {
    id: Args.string({
      description: 'Rule ID.',
      required: true,
    }),
  }

  static description = 'List executions for a rule.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(RulesExecutions)
    return this.getList(apiPath('/v1/rules/{id}/executions', args), flags)
  }
}
