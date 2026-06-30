import {listFlags, ListCommand} from '../../list-command.js'
import {buildCompanyListShortcuts, COMPANY_REQUEST_OPTIONS, companyListFlags} from '../../companies/shared.js'

export default class CompaniesList extends ListCommand {
  static description = 'List companies in the token organization.'
  static enableJsonFlag = true
  static flags = {
    ...listFlags,
    ...companyListFlags,
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(CompaniesList)
    return this.getList('/v1/companies', flags, buildCompanyListShortcuts(flags), COMPANY_REQUEST_OPTIONS)
  }
}
