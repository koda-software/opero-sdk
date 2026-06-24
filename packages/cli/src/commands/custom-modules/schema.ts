import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class CustomModulesSchema extends ReadCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
  }

  static description = 'Get custom module schema context.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomModulesSchema)
    return this.getJson(apiPath('/v1/custom-modules/{moduleKey}/schema', args), flags)
  }
}
