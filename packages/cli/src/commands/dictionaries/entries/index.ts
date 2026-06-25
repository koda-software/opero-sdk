import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {listFlags, ListCommand} from '../../../list-command.js'

export default class DictionariesEntries extends ListCommand {
  static args = {
    dictionaryId: Args.string({
      description: 'Dictionary ID.',
      required: true,
    }),
  }

  static description = 'List dictionary entries.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(DictionariesEntries)
    return this.getList(apiPath('/v1/dictionaries/{dictionaryId}/entries', args), flags)
  }
}
