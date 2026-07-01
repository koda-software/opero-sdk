import {bodyFileFlag, readRequiredJsonBodyFile, WriteCommand} from '../../write-command.js'

export default class ServiceCatalogCreate extends WriteCommand {
  static description = 'Create a service catalog item.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ServiceCatalogCreate)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.post(this.companyApiPath('/v1/companies/{companyId}/service-catalog/items', settings), {
      body: await readRequiredJsonBodyFile(flags['body-file']),
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
