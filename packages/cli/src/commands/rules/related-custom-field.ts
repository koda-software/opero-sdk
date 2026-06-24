import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {listFlags, ListCommand} from '../../list-command.js'

export default class RulesRelatedCustomField extends ListCommand {
  static args = {
    fieldDefinitionId: Args.string({
      description: 'Custom field definition ID.',
      required: true,
    }),
  }

  static description = 'List rules related to a custom field.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(RulesRelatedCustomField)
    return this.getList(apiPath('/v1/rules/related/custom-fields/{fieldDefinitionId}', args), flags)
  }
}
