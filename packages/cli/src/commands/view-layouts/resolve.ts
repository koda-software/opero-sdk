import {ReadCommand} from '../../read-command.js'
import {buildViewLayoutQuery, viewLayoutContextFlags} from '../../view-layouts/flags.js'

export default class ViewLayoutsResolve extends ReadCommand {
  static description = 'Resolve the published view layout for runtime rendering.'
  static enableJsonFlag = true
  static flags = viewLayoutContextFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ViewLayoutsResolve)
    return this.getJson('/v1/view-layouts/resolve', flags, buildViewLayoutQuery(flags))
  }
}
