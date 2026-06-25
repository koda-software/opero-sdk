import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class DictionariesEntriesGet extends ReadCommand {
  static args = {
    dictionaryId: Args.string({
      description: 'Dictionary ID.',
      required: true,
    }),
    entryId: Args.string({
      description: 'Dictionary entry ID.',
      required: true,
    }),
  }

  static description = 'Get one dictionary entry.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(DictionariesEntriesGet)
    return this.getJson(apiPath('/v1/dictionaries/{dictionaryId}/entries/{entryId}', args), flags)
  }
}
