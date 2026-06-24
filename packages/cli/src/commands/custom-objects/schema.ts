import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class CustomObjectsSchema extends ReadCommand {
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

  static description = 'Get custom object schema context.'
  static enableJsonFlag = true
  static flags = {
    mode: Flags.string({
      description: 'Schema context mode.',
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomObjectsSchema)
    return this.getJson(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/schema', args), flags, {mode: flags.mode})
  }
}
