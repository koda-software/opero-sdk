import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {WriteCommand} from '../../../write-command.js'

export default class CustomModulesSchemaDraftsDelete extends WriteCommand {
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

  static description = 'Delete a custom module schema draft immediately.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomModulesSchemaDraftsDelete)
    return this.deleteJson(apiPath('/v1/custom-modules/{moduleKey}/schema/drafts/{draftId}', args), flags)
  }
}
