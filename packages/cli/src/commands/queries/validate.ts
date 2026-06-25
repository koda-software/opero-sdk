import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class QueriesValidate extends WriteCommand {
  static description = 'Validate saved query SQL and parameters without saving.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(QueriesValidate)
    return this.postJson('/v1/saved-queries/validate', flags)
  }
}
