import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class CustomModulesUpdate extends WriteCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
  }

  static description = 'Update custom module metadata.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomModulesUpdate)
    return this.patchJson(apiPath('/v1/custom-modules/{moduleKey}', args), flags)
  }
}
