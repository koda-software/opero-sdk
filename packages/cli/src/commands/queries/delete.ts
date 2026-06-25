import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class QueriesDelete extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Saved query ID.',
      required: true,
    }),
  }

  static description = 'Delete an organization saved query immediately.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(QueriesDelete)
    return this.deleteJson(apiPath('/v1/saved-queries/{id}', args), flags)
  }
}
