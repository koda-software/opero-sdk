import {ReadCommand} from '../../read-command.js'

export default class QueriesSchema extends ReadCommand {
  static description = 'Get queryable SQL schema for saved queries.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {flags} = await this.parse(QueriesSchema)
    return this.getJson('/v1/saved-queries/schema', flags)
  }
}
