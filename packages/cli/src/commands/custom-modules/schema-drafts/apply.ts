import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class CustomModulesSchemaDraftsApply extends WriteCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
    draftId: Args.string({
      description: 'Schema draft ID.',
      required: true,
    }),
  }

  static description = 'Apply a custom module schema draft.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomModulesSchemaDraftsApply)
    return this.postJson(apiPath('/v1/custom-modules/{moduleKey}/schema/drafts/{draftId}/apply', args), flags)
  }
}
