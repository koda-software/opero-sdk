import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {listFlags, ListCommand} from '../../list-command.js'

export default class RulesRelatedCustomModule extends ListCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
  }

  static description = 'List rules related to a custom module.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(RulesRelatedCustomModule)
    return this.getList(apiPath('/v1/rules/related/custom-modules/{moduleKey}', args), flags)
  }
}
