import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class DictionariesCreate extends WriteCommand {
  static description = 'Create a dictionary.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(DictionariesCreate)
    return this.postJson('/v1/dictionaries', flags)
  }
}
