import {listFlags, ListCommand} from '../../list-command.js'

export default class WorkflowsList extends ListCommand {
  static description = 'List workflows.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(WorkflowsList)
    return this.getList('/v1/workflows', flags)
  }
}
