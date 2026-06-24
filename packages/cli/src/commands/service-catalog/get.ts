import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
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
    return this.getJson(apiPath('/v1/service-catalog/items/{id}', args), flags)
  }
}
