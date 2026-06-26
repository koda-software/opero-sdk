import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class WorkflowsTasksGet extends ReadCommand {
  static args = {
    taskId: Args.string({
      description: 'Workflow task ID.',
      required: true,
    }),
  }

  static description = 'Get a workflow task.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowsTasksGet)
    return this.getJson(apiPath('/v1/workflows/tasks/{taskId}', args), flags)
  }
}
