import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {WriteCommand} from '../../../write-command.js'

export default class WorkflowsPublicationsCreateDraft extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Workflow ID.',
      required: true,
    }),
    publicationId: Args.string({
      description: 'Workflow publication ID.',
      required: true,
    }),
  }

  static description = 'Create an editable draft from a workflow publication.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsPublicationsCreateDraft)
    return this.postNoBody(
      apiPath('/v1/workflows/{workflowId}/publications/{publicationId}/create-draft', {
        publicationId: args.publicationId,
        workflowId: args.id,
      }),
      flags,
    )
  }
}
