import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class WorkflowsRuntimeExecuteTransition extends WriteCommand {
  static args = {
    instanceId: Args.string({
      description: 'Workflow instance ID.',
      required: true,
    }),
    transitionId: Args.string({
      description: 'Workflow transition ID.',
      required: true,
    }),
  }

  static description = 'Execute a workflow transition.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsRuntimeExecuteTransition)
    return this.postJson(apiPath('/v1/workflows/runtime/instances/{instanceId}/transitions/{transitionId}', args), flags)
  }
}
