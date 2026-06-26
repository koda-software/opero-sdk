import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class WorkflowsDraftGet extends ReadCommand {
  static args = {
    workflowId: Args.string({
      description: 'Workflow ID.',
      required: true,
    }),
  }

  static description = 'Get the editable workflow draft.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsDraftGet)
    return this.getJson(apiPath('/v1/workflows/{workflowId}/draft', args), flags)
  }
}
