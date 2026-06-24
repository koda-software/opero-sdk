import {Flags} from '@oclif/core'

import {listFlags, ListCommand} from '../../list-command.js'

export default class ServiceCatalogList extends ListCommand {
  static description = 'List service catalog items.'
  static enableJsonFlag = true
  static flags = {
    ...listFlags,
    search: Flags.string({
      description: 'Case-insensitive search across code and name.',
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ServiceCatalogList)
    return this.getList('/v1/service-catalog/items', flags, {search: flags.search})
  }
}
