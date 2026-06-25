import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class QueriesUpdate extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Saved query ID.',
      required: true,
    }),
  }

  static description = 'Update an organization saved query.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(QueriesUpdate)
    return this.patchJson(apiPath('/v1/saved-queries/{id}', args), flags)
  }
}
