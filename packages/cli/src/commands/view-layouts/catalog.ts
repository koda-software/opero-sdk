import {ReadCommand} from '../../read-command.js'
import {buildViewLayoutQuery, viewLayoutCatalogFlags} from '../../view-layouts/flags.js'

export default class ViewLayoutsCatalog extends ReadCommand {
  static description = 'Get the view layout block catalog.'
  static enableJsonFlag = true
  static flags = viewLayoutCatalogFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ViewLayoutsCatalog)
    return this.getJson('/v1/view-layouts/catalog', flags, buildViewLayoutQuery(flags))
  }
}
