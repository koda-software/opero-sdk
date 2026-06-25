import {bodyFileFlag, WriteCommand} from '../../../../../write-command.js'
import {buildViewLayoutQuery, viewLayoutContextFlags} from '../../../../../view-layouts/flags.js'

export default class ViewLayoutsRuntimeDynamicObjectRecordsCreate extends WriteCommand {
  static description = 'Create a dynamic record through a view layout.'
  static enableJsonFlag = true
  static flags = {
    ...viewLayoutContextFlags,
    ...bodyFileFlag,
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ViewLayoutsRuntimeDynamicObjectRecordsCreate)
    return this.postJson('/v1/view-layouts/runtime/dynamic-object/records', flags, undefined, buildViewLayoutQuery(flags))
  }
}
