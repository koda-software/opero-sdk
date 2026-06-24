import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class CustomModulesSchemaDraftsList extends ReadCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
  }

  static description = 'List custom module schema drafts.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomModulesSchemaDraftsList)
    return this.getJson(apiPath('/v1/custom-modules/{moduleKey}/schema/drafts', args), flags)
  }
}
