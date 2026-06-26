import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class WorkflowsUpdate extends WriteCommand {
  static args = {
    workflowId: Args.string({
      description: 'Workflow ID.',
      required: true,
    }),
  }

  static description = 'Update workflow metadata.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsUpdate)
    return this.patchJson(apiPath('/v1/workflows/{workflowId}', args), flags)
  }
}
