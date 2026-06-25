import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class ViewLayoutsDraftSave extends WriteCommand {
  static args = {
    layoutId: Args.string({
      description: 'View layout ID.',
      required: true,
    }),
  }

  static description = 'Save a view layout draft.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsDraftSave)
    return this.putJson(apiPath('/v1/view-layouts/{layoutId}/draft', args), flags)
  }
}
