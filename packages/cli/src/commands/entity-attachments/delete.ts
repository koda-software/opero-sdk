import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class EntityAttachmentsDelete extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Entity attachment ID.',
      required: true,
    }),
  }

  static description = 'Delete an entity attachment.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(EntityAttachmentsDelete)
    return this.deleteJson(apiPath('/v1/entity-attachments/{id}', args), flags)
  }
}
