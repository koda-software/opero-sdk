import {bodyFileFlag, WriteCommand} from '../../write-command.js'
import {buildViewLayoutQuery, viewLayoutContextFlags} from '../../view-layouts/flags.js'

export default class ViewLayoutsRuntimeData extends WriteCommand {
  static description = 'Load view layout runtime data.'
  static enableJsonFlag = true
  static flags = {
    ...viewLayoutContextFlags,
    ...bodyFileFlag,
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ViewLayoutsRuntimeData)
    return this.postJson('/v1/view-layouts/runtime-data', flags, undefined, buildViewLayoutQuery(flags))
  }
}
