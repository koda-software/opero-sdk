import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class WorkflowsTasksReassign extends WriteCommand {
  static args = {
    taskId: Args.string({
      description: 'Workflow task ID.',
      required: true,
    }),
  }

  static description = 'Reassign an open workflow task.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsTasksReassign)
    return this.postJson(apiPath('/v1/workflows/tasks/{taskId}/reassign', args), flags)
  }
}
