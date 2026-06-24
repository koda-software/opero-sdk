import {listFlags, ListCommand} from '../../list-command.js'

export default class RulesList extends ListCommand {
  static description = 'List automation rules.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(RulesList)
    return this.getList('/v1/rules', flags)
  }
}
