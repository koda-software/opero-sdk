import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class QueriesExecute extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Saved query ID.',
      required: true,
    }),
  }

  static description = 'Execute a saved query with named parameters.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(QueriesExecute)
    return this.postJson(apiPath('/v1/saved-queries/{id}/execute', args), flags)
  }
}
