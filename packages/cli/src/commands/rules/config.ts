import {ReadCommand} from '../../read-command.js'

export default class RulesConfig extends ReadCommand {
  static description = 'Get rule builder configuration.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {flags} = await this.parse(RulesConfig)
    return this.getJson('/v1/rules/config', flags)
  }
}
