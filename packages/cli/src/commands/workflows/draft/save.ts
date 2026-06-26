import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class WorkflowsDraftSave extends WriteCommand {
  static args = {
    workflowId: Args.string({
      description: 'Workflow ID.',
      required: true,
    }),
  }

  static description = 'Replace the editable workflow draft definition.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsDraftSave)
    return this.putJson(apiPath('/v1/workflows/{workflowId}/draft', args), flags)
  }
}
