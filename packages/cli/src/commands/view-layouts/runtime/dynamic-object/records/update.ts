import {Args} from '@oclif/core'

import {apiPath} from '../../../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../../../write-command.js'
import {buildViewLayoutQuery, viewLayoutContextFlags} from '../../../../../view-layouts/flags.js'

export default class ViewLayoutsRuntimeDynamicObjectRecordsUpdate extends WriteCommand {
  static args = {
    recordId: Args.string({
      description: 'Dynamic record ID.',
      required: true,
    }),
  }

  static description = 'Update a dynamic record through a view layout.'
  static enableJsonFlag = true
  static flags = {
    ...viewLayoutContextFlags,
    ...bodyFileFlag,
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsRuntimeDynamicObjectRecordsUpdate)
    return this.patchJson(apiPath('/v1/view-layouts/runtime/dynamic-object/records/{recordId}', args), flags, undefined, buildViewLayoutQuery(flags))
  }
}
