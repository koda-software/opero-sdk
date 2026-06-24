import {listFlags, ListCommand} from '../../list-command.js'

export default class ContractorsList extends ListCommand {
  static description = 'List contractors.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ContractorsList)
    return this.getList('/v1/contractors', flags)
  }
}
