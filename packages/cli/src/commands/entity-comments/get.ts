import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class EntityCommentsGet extends ReadCommand {
  static args = {
    id: Args.string({
      description: 'Entity comment ID.',
      required: true,
    }),
  }

  static description = 'Get one entity comment.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(EntityCommentsGet)
    return this.getJson(apiPath('/v1/entity-comments/{id}', args), flags)
  }
}
