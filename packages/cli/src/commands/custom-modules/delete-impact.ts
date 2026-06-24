import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class CustomModulesDeleteImpact extends ReadCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
  }

  static description = 'Preview custom module delete impact.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomModulesDeleteImpact)
    return this.getJson(apiPath('/v1/custom-modules/{moduleKey}/delete-impact', args), flags)
  }
}
