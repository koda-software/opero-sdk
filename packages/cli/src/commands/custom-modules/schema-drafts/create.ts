import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class CustomModulesSchemaDraftsCreate extends WriteCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
  }

  static description = 'Create a custom module schema draft.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomModulesSchemaDraftsCreate)
    return this.postJson(apiPath('/v1/custom-modules/{moduleKey}/schema/drafts', args), flags)
  }
}
