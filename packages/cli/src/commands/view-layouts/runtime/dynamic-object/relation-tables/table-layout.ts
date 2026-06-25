import {bodyFileFlag, WriteCommand} from '../../../../../write-command.js'
import {buildViewLayoutQuery, viewLayoutContextFlags} from '../../../../../view-layouts/flags.js'

export default class ViewLayoutsRuntimeDynamicObjectRelationTablesTableLayout extends WriteCommand {
  static description = 'Get relation-table row layout data.'
  static enableJsonFlag = true
  static flags = {
    ...viewLayoutContextFlags,
    ...bodyFileFlag,
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ViewLayoutsRuntimeDynamicObjectRelationTablesTableLayout)
    return this.postJson('/v1/view-layouts/runtime/dynamic-object/relation-tables/table-layout', flags, undefined, buildViewLayoutQuery(flags))
  }
}
