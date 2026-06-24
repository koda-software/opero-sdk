import {listFlags, ListCommand} from '../../list-command.js'

export default class CustomModulesList extends ListCommand {
  static description = 'List custom modules.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(CustomModulesList)
    return this.getList('/v1/custom-modules', flags)
  }
}
