import {listFlags, ListCommand} from '../../list-command.js'
import {buildViewLayoutQuery, viewLayoutListFlags} from '../../view-layouts/flags.js'

export default class ViewLayoutsList extends ListCommand {
  static description = 'List view layouts.'
  static enableJsonFlag = true
  static flags = {
    ...listFlags,
    ...viewLayoutListFlags,
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ViewLayoutsList)
    return this.getList('/v1/view-layouts', flags, buildViewLayoutQuery(flags))
  }
}
