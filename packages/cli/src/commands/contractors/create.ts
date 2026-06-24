import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class ContractorsCreate extends WriteCommand {
  static description = 'Create a contractor.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ContractorsCreate)
    return this.postJson('/v1/contractors', flags)
  }
}
