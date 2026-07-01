import {Flags} from '@oclif/core'

import {ReadCommand} from '../../read-command.js'

export default class EntityAttachmentsList extends ReadCommand {
  static description = 'List attachments for an entity.'
  static enableJsonFlag = true
  static flags = {
    'entity-id': Flags.string({
      description: 'Target entity ID.',
      required: true,
    }),
    'entity-type': Flags.string({
      description: 'Target entity type, for example contractor or custom_record.crm.deal.',
      required: true,
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(EntityAttachmentsList)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get(this.companyApiPath('/v1/companies/{companyId}/entity-attachments', settings), {
      query: {
        entityId: flags['entity-id'],
        entityType: flags['entity-type'],
      },
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
