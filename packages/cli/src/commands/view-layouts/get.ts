import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class ViewLayoutsGet extends ReadCommand {
  static args = {
    layoutId: Args.string({
      description: 'View layout ID.',
      required: true,
    }),
  }

  static description = 'Get one view layout.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsGet)
    return this.getJson(apiPath('/v1/view-layouts/{layoutId}', args), flags)
  }
}
