import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class WorkflowTemplatesCreateWorkflow extends WriteCommand {
  static args = {
    templateId: Args.string({
      description: 'Workflow template ID.',
      required: true,
    }),
  }

  static description = 'Create a workflow from a template.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(WorkflowTemplatesCreateWorkflow)
    return this.postJson(apiPath('/v1/workflow-templates/{templateId}/create-workflow', args), flags)
  }
}
