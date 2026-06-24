import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class CustomObjectsDeleteImpact extends ReadCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
    objectKey: Args.string({
      description: 'Custom object key.',
      required: true,
    }),
  }

  static description = 'Preview custom object delete impact.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomObjectsDeleteImpact)
    return this.getJson(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/delete-impact', args), flags)
  }
}
