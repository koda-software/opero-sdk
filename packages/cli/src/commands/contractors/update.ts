import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class ContractorsUpdate extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Contractor ID.',
      required: true,
    }),
  }

  static description = 'Update a contractor.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ContractorsUpdate)
    return this.patchJson(apiPath('/v1/contractors/{id}', args), flags)
  }
}
