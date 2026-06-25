import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class ViewLayoutsArchive extends WriteCommand {
  static args = {
    layoutId: Args.string({
      description: 'View layout ID.',
      required: true,
    }),
  }

  static description = 'Archive a view layout.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsArchive)
    return this.postNoBody(apiPath('/v1/view-layouts/{layoutId}/archive', args), flags)
  }
}
