import {Args} from '@oclif/core'

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
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.delete(this.companyApiPath('/v1/companies/{companyId}/entity-comments/comments/{id}', settings, args))

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
