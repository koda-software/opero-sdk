import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class ViewLayoutsVersionsGet extends ReadCommand {
  static args = {
    layoutId: Args.string({
      description: 'View layout ID.',
      required: true,
    }),
    versionId: Args.string({
      description: 'View layout version ID.',
      required: true,
    }),
  }

  static description = 'Get a view layout version.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsVersionsGet)
    return this.getJson(apiPath('/v1/view-layouts/{layoutId}/versions/{versionId}', args), flags)
  }
}
