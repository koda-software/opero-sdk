import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'
import {buildCompanyUpdateBody, COMPANY_REQUEST_OPTIONS, companyBodyFlags} from './shared.js'

export default class CompaniesUpdate extends WriteCommand {
  static args = {
    companyId: Args.string({
      description: 'Company ID.',
      required: true,
    }),
  }

  static description = 'Update a company in the token organization.'
  static enableJsonFlag = true
  static flags = companyBodyFlags

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CompaniesUpdate)
    return this.patchJson(apiPath('/v1/companies/{companyId}', args), flags, await buildCompanyUpdateBody(flags), undefined, COMPANY_REQUEST_OPTIONS)
  }
}
