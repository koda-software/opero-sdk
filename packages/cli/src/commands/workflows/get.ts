import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class WorkflowsGet extends ReadCommand {
  static args = {
    workflowId: Args.string({
      description: 'Workflow ID.',
      required: true,
    }),
  }

  static description = 'Get workflow details.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsGet)
    return this.getJson(apiPath('/v1/workflows/{workflowId}', args), flags)
  }
}
