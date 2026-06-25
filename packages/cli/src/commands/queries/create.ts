import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class QueriesCreate extends WriteCommand {
  static description = 'Create and validate an organization saved query.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(QueriesCreate)
    return this.postJson('/v1/saved-queries', flags)
  }
}
