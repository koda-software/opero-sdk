import {Args} from '@oclif/core'

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
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.get(this.companyApiPath('/v1/companies/{companyId}/entity-comments/comments/{id}', settings, args), {
      query: undefined,
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
