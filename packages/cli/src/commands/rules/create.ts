import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class RulesCreate extends WriteCommand {
  static description = 'Create an automation rule.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(RulesCreate)
    return this.postJson('/v1/rules', flags)
  }
}
