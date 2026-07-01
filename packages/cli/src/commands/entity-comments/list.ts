import {Flags} from '@oclif/core'

import {listFlags, ListCommand} from '../../list-command.js'

export default class EntityCommentsList extends ListCommand {
  static description = 'List comments for an entity.'
  static enableJsonFlag = true
  static flags = {
    ...listFlags,
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
    const {flags} = await this.parse(EntityCommentsList)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get(
      this.companyApiPath('/v1/companies/{companyId}/entity-comments/{entityType}/{entityId}', settings, {
        entityId: flags['entity-id'],
        entityType: flags['entity-type'],
      }),
      {query: this.buildListQuery(flags)},
    )

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
