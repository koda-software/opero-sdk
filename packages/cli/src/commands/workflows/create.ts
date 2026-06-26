import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class WorkflowsCreate extends WriteCommand {
  static description = 'Create a workflow.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(WorkflowsCreate)
    return this.postJson('/v1/workflows', flags)
  }
}
