import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../write-command.js'

export default class ViewLayoutsVersionsRestoreDraft extends WriteCommand {
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

  static description = 'Restore a view layout version as draft.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsVersionsRestoreDraft)
    return this.postJson(apiPath('/v1/view-layouts/{layoutId}/versions/{versionId}/restore-draft', args), flags)
  }
}
