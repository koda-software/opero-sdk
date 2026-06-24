import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class EntityCommentsDelete extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Entity comment ID.',
      required: true,
    }),
  }

  static description = 'Delete an entity comment.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(EntityCommentsDelete)
    return this.deleteJson(apiPath('/v1/entity-comments/{id}', args), flags)
  }
}
