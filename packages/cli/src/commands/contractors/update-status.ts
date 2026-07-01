import {Args} from '@oclif/core'

import {bodyFileFlag, readRequiredJsonBodyFile, WriteCommand} from '../../write-command.js'

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
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.patch(this.companyApiPath('/v1/companies/{companyId}/contractors/{id}/status', settings, args), {
      body: await readRequiredJsonBodyFile(flags['body-file']),
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
