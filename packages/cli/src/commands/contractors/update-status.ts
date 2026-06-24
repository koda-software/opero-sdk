import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class ContractorsUpdateStatus extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Contractor ID.',
      required: true,
    }),
  }

  static description = 'Update contractor status.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ContractorsUpdateStatus)
    return this.patchJson(apiPath('/v1/contractors/{id}/status', args), flags)
  }
}
