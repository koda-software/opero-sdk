import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'
import {buildWorkflowTargetQuery, workflowTargetQueryFlags, workflowTargetTypeOptions} from '../../../workflows/flags.js'

export default class WorkflowsRuntimeTargetState extends ReadCommand {
  static args = {
    targetId: Args.string({
      description: 'Target record ID.',
      required: true,
    }),
  }

  static description = 'Get workflow runtime state for a target record.'
  static enableJsonFlag = true
  static flags = {
    ...workflowTargetQueryFlags,
    'target-type': Flags.string({
      description: 'Workflow target type.',
      options: workflowTargetTypeOptions,
      required: true,
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsRuntimeTargetState)
    return this.getJson(
      apiPath('/v1/workflows/runtime/targets/{targetType}/{targetId}', {
        targetId: args.targetId,
        targetType: flags['target-type'],
      }),
      flags,
      buildWorkflowTargetQuery(flags),
    )
  }
}
