import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class ViewLayoutsAssignmentsReplace extends WriteCommand {
  static args = {
    layoutId: Args.string({
      description: 'View layout ID.',
      required: true,
    }),
  }

  static description = 'Replace view layout assignments.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsAssignmentsReplace)
    return this.putJson(apiPath('/v1/view-layouts/{layoutId}/assignments', args), flags)
  }
}
