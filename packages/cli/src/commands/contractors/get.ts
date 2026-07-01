import {Args} from '@oclif/core'

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
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get(this.companyApiPath('/v1/companies/{companyId}/contractors/{id}', settings, args), {
      query: undefined,
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
