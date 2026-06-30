import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'
import {COMPANY_REQUEST_OPTIONS} from './shared.js'

export default class CompaniesGet extends ReadCommand {
  static args = {
    companyId: Args.string({
      description: 'Company ID.',
      required: true,
    }),
  }

  static description = 'Get one company from the token organization.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CompaniesGet)
    return this.getJson(apiPath('/v1/companies/{companyId}', args), flags, undefined, COMPANY_REQUEST_OPTIONS)
  }
}
