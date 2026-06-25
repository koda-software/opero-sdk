import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class ViewLayoutsVersionsList extends ReadCommand {
  static args = {
    layoutId: Args.string({
      description: 'View layout ID.',
      required: true,
    }),
  }

  static description = 'List view layout versions.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsVersionsList)
    return this.getJson(apiPath('/v1/view-layouts/{layoutId}/versions', args), flags)
  }
}
