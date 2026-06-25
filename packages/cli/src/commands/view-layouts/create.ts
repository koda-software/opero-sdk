import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class ViewLayoutsCreate extends WriteCommand {
  static description = 'Create a view layout.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ViewLayoutsCreate)
    return this.postJson('/v1/view-layouts', flags)
  }
}
