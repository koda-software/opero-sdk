import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class RulesContextSchemas extends WriteCommand {
  static description = 'Compute rule context schemas from a draft request body.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(RulesContextSchemas)
    return this.postJson('/v1/rules/context-schemas', flags)
  }
}
