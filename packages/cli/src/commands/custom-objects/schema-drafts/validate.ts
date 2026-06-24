import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {WriteCommand} from '../../../write-command.js'

export default class CustomObjectsSchemaDraftsValidate extends WriteCommand {
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

  static description = 'Validate a custom object schema draft.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomObjectsSchemaDraftsValidate)
    return this.postNoBody(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/schema/drafts/{draftId}/validate', args), flags)
  }
}
