import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {listFlags, ListCommand} from '../../../list-command.js'

export default class WorkflowsPublicationsList extends ListCommand {
  static args = {
    workflowId: Args.string({
      description: 'Workflow ID.',
      required: true,
    }),
  }

  static description = 'List workflow publications.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsPublicationsList)
    return this.getList(apiPath('/v1/workflows/{workflowId}/publications', args), flags)
  }
}
