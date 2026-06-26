import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class WorkflowsRuntimeGet extends ReadCommand {
  static args = {
    instanceId: Args.string({
      description: 'Workflow instance ID.',
      required: true,
    }),
  }

  static description = 'Get a workflow instance.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsRuntimeGet)
    return this.getJson(apiPath('/v1/workflows/runtime/instances/{instanceId}', args), flags)
  }
}
