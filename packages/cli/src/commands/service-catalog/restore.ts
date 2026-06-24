import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class ServiceCatalogRestore extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Service catalog item ID.',
      required: true,
    }),
  }

  static description = 'Restore a service catalog item.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ServiceCatalogRestore)
    return this.patchNoBody(apiPath('/v1/service-catalog/items/{id}/restore', args), flags)
  }
}
