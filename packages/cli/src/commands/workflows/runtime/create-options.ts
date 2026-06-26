import {Flags} from '@oclif/core'

import {ReadCommand} from '../../../read-command.js'
import {buildWorkflowTargetQuery, workflowTargetQueryFlags, workflowTargetTypeOptions} from '../../../workflows/flags.js'

export default class WorkflowsRuntimeCreateOptions extends ReadCommand {
  static description = 'Get workflow options for creating a target record.'
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
    const {flags} = await this.parse(WorkflowsRuntimeCreateOptions)
    return this.getJson('/v1/workflows/runtime/create-options', flags, {
      targetType: flags['target-type'],
      ...buildWorkflowTargetQuery(flags),
    })
  }
}
