import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class CustomModulesSchemaDraftsUpdate extends WriteCommand {
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

  static description = 'Update a custom module schema draft.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomModulesSchemaDraftsUpdate)
    return this.patchJson(apiPath('/v1/custom-modules/{moduleKey}/schema/drafts/{draftId}', args), flags)
  }
}
