import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class CustomObjectsSchemaDraftsGet extends ReadCommand {
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

  static description = 'Get one custom object schema draft.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomObjectsSchemaDraftsGet)
    return this.getJson(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/schema/drafts/{draftId}', args), flags)
  }
}
