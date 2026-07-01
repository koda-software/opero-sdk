import {listFlags, ListCommand} from '../../list-command.js'

export default class ContractorsList extends ListCommand {
  static description = 'List contractors.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ContractorsList)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get(this.companyApiPath('/v1/companies/{companyId}/contractors', settings), {
      query: this.buildListQuery(flags),
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
