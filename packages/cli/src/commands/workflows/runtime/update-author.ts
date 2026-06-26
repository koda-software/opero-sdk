import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class WorkflowsRuntimeUpdateAuthor extends WriteCommand {
  static args = {
    instanceId: Args.string({
      description: 'Workflow instance ID.',
      required: true,
    }),
  }

  static description = 'Update workflow instance author.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsRuntimeUpdateAuthor)
    return this.patchJson(apiPath('/v1/workflows/runtime/instances/{instanceId}/author', args), flags)
  }
}
