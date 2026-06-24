import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {listFlags, ListCommand} from '../../list-command.js'

export default class RulesRelatedCustomObject extends ListCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
    objectKey: Args.string({
      description: 'Custom object key.',
      required: true,
    }),
  }

  static description = 'List rules related to a custom object.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(RulesRelatedCustomObject)
    return this.getList(apiPath('/v1/rules/related/custom-objects/{moduleKey}/{objectKey}', args), flags)
  }
}
