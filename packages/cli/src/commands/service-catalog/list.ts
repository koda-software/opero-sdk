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
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get(this.companyApiPath('/v1/companies/{companyId}/service-catalog/items', settings), {
      query: this.buildListQuery(flags, {search: flags.search}),
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
