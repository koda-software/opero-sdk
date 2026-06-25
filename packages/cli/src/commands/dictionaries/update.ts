import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class DictionariesUpdate extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Dictionary ID.',
      required: true,
    }),
  }

  static description = 'Update dictionary metadata and entries.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(DictionariesUpdate)
    return this.patchJson(apiPath('/v1/dictionaries/{id}', args), flags)
  }
}
