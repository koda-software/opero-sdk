import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class RulesValidateScript extends WriteCommand {
  static description = 'Validate a rule script request body.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(RulesValidateScript)
    return this.postJson('/v1/rules/validate-script', flags)
  }
}
