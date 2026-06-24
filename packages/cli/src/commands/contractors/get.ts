import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class ContractorsGet extends ReadCommand {
  static args = {
    id: Args.string({
      description: 'Contractor ID.',
      required: true,
    }),
  }

  static description = 'Get one contractor.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ContractorsGet)
    return this.getJson(apiPath('/v1/contractors/{id}', args), flags)
  }
}
