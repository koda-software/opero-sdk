import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class WorkflowsDiscardDraft extends WriteCommand {
  static args = {
    workflowId: Args.string({
      description: 'Workflow ID.',
      required: true,
    }),
  }

  static description = 'Discard the editable workflow draft.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsDiscardDraft)
    return this.postNoBody(apiPath('/v1/workflows/{workflowId}/discard-draft', args), flags)
  }
}
