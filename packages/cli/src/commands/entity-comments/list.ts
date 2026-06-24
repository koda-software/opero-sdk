import {Flags} from '@oclif/core'

import {apiPath} from '../../api/path.js'
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
    return this.getList(
      apiPath('/v1/entity-comments/{entityType}/{entityId}', {
        entityId: flags['entity-id'],
        entityType: flags['entity-type'],
      }),
      flags,
    )
  }
}
