import {Args} from '@oclif/core'

import {ReadCommand} from '../../read-command.js'

export default class ServiceCatalogGet extends ReadCommand {
  static args = {
    id: Args.string({
      description: 'Service catalog item ID.',
      required: true,
    }),
  }

  static description = 'Get one service catalog item.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ServiceCatalogGet)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get(this.companyApiPath('/v1/companies/{companyId}/service-catalog/items/{id}', settings, args), {
      query: undefined,
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
