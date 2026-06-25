import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class ViewLayoutsPublish extends WriteCommand {
  static args = {
    layoutId: Args.string({
      description: 'View layout ID.',
      required: true,
    }),
  }

  static description = 'Publish a view layout draft.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsPublish)
    return this.postJson(apiPath('/v1/view-layouts/{layoutId}/publish', args), flags)
  }
}
