import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'
import {buildWorkflowTargetQuery, workflowTargetQueryFlags, workflowTargetTypeOptions} from '../../../workflows/flags.js'

export default class WorkflowsRuntimeStart extends WriteCommand {
  static args = {
    targetId: Args.string({
      description: 'Target record ID.',
      required: true,
    }),
  }

  static description = 'Start a workflow instance for a target record.'
  static enableJsonFlag = true
  static flags = {
    ...workflowTargetQueryFlags,
    ...bodyFileFlag,
    'target-type': Flags.string({
      description: 'Workflow target type.',
      options: workflowTargetTypeOptions,
      required: true,
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsRuntimeStart)
    return this.postJson(
      apiPath('/v1/workflows/runtime/targets/{targetType}/{targetId}/instances', {
        targetId: args.targetId,
        targetType: flags['target-type'],
      }),
      flags,
      undefined,
      buildWorkflowTargetQuery(flags),
    )
  }
}
