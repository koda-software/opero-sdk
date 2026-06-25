import {Args} from '@oclif/core'

import {apiPath} from '../../../../../api/path.js'
import {ReadCommand} from '../../../../../read-command.js'
import {buildViewLayoutQuery, relationTargetFlags} from '../../../../../view-layouts/flags.js'

export default class ViewLayoutsRuntimeDynamicObjectRelationTablesTargetLayout extends ReadCommand {
  static args = {
    relationFieldKey: Args.string({
      description: 'Parent one-to-many reference field key.',
      required: true,
    }),
  }

  static description = 'Resolve relation-table target layout.'
  static enableJsonFlag = true
  static flags = relationTargetFlags

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsRuntimeDynamicObjectRelationTablesTargetLayout)
    return this.getJson(
      apiPath('/v1/view-layouts/runtime/dynamic-object/relation-tables/{relationFieldKey}/target-layout', args),
      flags,
      buildViewLayoutQuery(flags),
    )
  }
}
