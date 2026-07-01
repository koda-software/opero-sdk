import {Args} from '@oclif/core'

import {WriteCommand} from '../../write-command.js'

export default class ServiceCatalogArchive extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Service catalog item ID.',
      required: true,
    }),
  }

  static description = 'Archive a service catalog item.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ServiceCatalogArchive)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.patch(this.companyApiPath('/v1/companies/{companyId}/service-catalog/items/{id}/archive', settings, args))

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
