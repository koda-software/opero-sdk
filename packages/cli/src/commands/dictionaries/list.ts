import {listFlags, ListCommand} from '../../list-command.js'

export default class DictionariesList extends ListCommand {
  static description = 'List dictionaries.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(DictionariesList)
    return this.getList('/v1/dictionaries', flags)
  }
}
