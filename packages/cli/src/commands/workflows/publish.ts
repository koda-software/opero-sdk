import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class WorkflowsPublish extends WriteCommand {
  static args = {
    workflowId: Args.string({
      description: 'Workflow ID.',
      required: true,
    }),
  }

  static description = 'Publish the current workflow draft.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsPublish)
    return this.postJson(apiPath('/v1/workflows/{workflowId}/publish', args), flags)
  }
}
