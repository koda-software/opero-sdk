import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class ServiceCatalogCreate extends WriteCommand {
  static description = 'Create a service catalog item.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ServiceCatalogCreate)
    return this.postJson('/v1/service-catalog/items', flags)
  }
}
