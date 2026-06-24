import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class CustomModulesSchemaDraftsGet extends ReadCommand {
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

  static description = 'Get one custom module schema draft.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomModulesSchemaDraftsGet)
    return this.getJson(apiPath('/v1/custom-modules/{moduleKey}/schema/drafts/{draftId}', args), flags)
  }
}
