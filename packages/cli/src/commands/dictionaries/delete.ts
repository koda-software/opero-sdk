import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class DictionariesDelete extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Dictionary ID.',
      required: true,
    }),
  }

  static description = 'Delete a dictionary.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(DictionariesDelete)
    return this.deleteJson(apiPath('/v1/dictionaries/{id}', args), flags)
  }
}
