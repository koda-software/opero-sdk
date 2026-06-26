import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class WorkflowsRuntimeHistory extends ReadCommand {
  static args = {
    instanceId: Args.string({
      description: 'Workflow instance ID.',
      required: true,
    }),
  }

  static description = 'Get workflow instance history.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsRuntimeHistory)
    return this.getJson(apiPath('/v1/workflows/runtime/instances/{instanceId}/history', args), flags)
  }
}
