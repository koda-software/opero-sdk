import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class EntityAttachmentsUpdate extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Entity attachment ID.',
      required: true,
    }),
  }

  static description = 'Update an entity attachment.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(EntityAttachmentsUpdate)
    return this.patchJson(apiPath('/v1/entity-attachments/{id}', args), flags)
  }
}
