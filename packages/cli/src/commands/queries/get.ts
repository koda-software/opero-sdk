import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class QueriesGet extends ReadCommand {
  static args = {
    id: Args.string({
      description: 'Saved query ID.',
      required: true,
    }),
  }

  static description = 'Get a saved query, including SQL.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(QueriesGet)
    return this.getJson(apiPath('/v1/saved-queries/{id}', args), flags)
  }
}
