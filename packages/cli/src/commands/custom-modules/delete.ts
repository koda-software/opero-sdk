import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class CustomModulesDelete extends WriteCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
  }

  static description = 'Delete a custom module immediately.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomModulesDelete)
    return this.deleteJson(apiPath('/v1/custom-modules/{moduleKey}', args), flags, {confirmModuleKey: args.moduleKey})
  }
}
