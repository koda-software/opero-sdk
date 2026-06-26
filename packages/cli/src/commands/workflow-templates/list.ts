import {listFlags, ListCommand} from '../../list-command.js'

export default class WorkflowTemplatesList extends ListCommand {
  static description = 'List workflow templates.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(WorkflowTemplatesList)
    return this.getList('/v1/workflow-templates', flags)
  }
}
