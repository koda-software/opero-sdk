import {Args} from '@oclif/core'

import {apiPath} from '../../../../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../../../../write-command.js'
import {buildViewLayoutQuery, relationQueryFlags} from '../../../../../view-layouts/flags.js'

export default class ViewLayoutsRuntimeDynamicObjectRelationTablesQuery extends WriteCommand {
  static args = {
    recordId: Args.string({
      description: 'Parent dynamic record ID.',
      required: true,
    }),
    relationFieldKey: Args.string({
      description: 'Parent one-to-many reference field key.',
      required: true,
    }),
  }

  static description = 'Query relation-table rows through a view layout.'
  static enableJsonFlag = true
  static flags = {
    ...relationQueryFlags,
    ...bodyFileFlag,
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsRuntimeDynamicObjectRelationTablesQuery)
    return this.postJson(
      apiPath('/v1/view-layouts/runtime/dynamic-object/records/{recordId}/relation-tables/{relationFieldKey}/query', args),
      flags,
      undefined,
      buildViewLayoutQuery(flags),
    )
  }
}
