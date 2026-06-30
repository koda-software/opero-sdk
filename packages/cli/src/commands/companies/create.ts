import {WriteCommand} from '../../write-command.js'
import {buildCompanyCreateBody, COMPANY_REQUEST_OPTIONS, companyBodyFlags} from './shared.js'

export default class CompaniesCreate extends WriteCommand {
  static description = 'Create a company in the token organization.'
  static enableJsonFlag = true
  static flags = companyBodyFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(CompaniesCreate)
    return this.postJson('/v1/companies', flags, await buildCompanyCreateBody(flags), undefined, COMPANY_REQUEST_OPTIONS)
  }
}
