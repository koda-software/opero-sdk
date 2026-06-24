import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class CustomObjectsSchemaDraftsApply extends WriteCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
    objectKey: Args.string({
      description: 'Custom object key.',
      required: true,
    }),
    draftId: Args.string({
      description: 'Schema draft ID.',
      required: true,
    }),
  }

  static description = 'Apply a custom object schema draft.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomObjectsSchemaDraftsApply)
    return this.postJson(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/schema/drafts/{draftId}/apply', args), flags)
  }
}
