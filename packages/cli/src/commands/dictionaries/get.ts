import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class DictionariesGet extends ReadCommand {
  static args = {
    id: Args.string({
      description: 'Dictionary ID.',
      required: true,
    }),
  }

  static description = 'Get one dictionary with entries.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(DictionariesGet)
    return this.getJson(apiPath('/v1/dictionaries/{id}', args), flags)
  }
}
