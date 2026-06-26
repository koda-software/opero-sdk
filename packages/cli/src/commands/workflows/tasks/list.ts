import {listFlags, ListCommand} from '../../../list-command.js'

export default class WorkflowsTasksList extends ListCommand {
  static description = 'List workflow tasks.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(WorkflowsTasksList)
    return this.getList('/v1/workflows/tasks', flags)
  }
}
