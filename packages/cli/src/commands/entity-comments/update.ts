import {Args} from '@oclif/core'

import {bodyFileFlag, readRequiredJsonBodyFile, WriteCommand} from '../../write-command.js'

export default class EntityCommentsUpdate extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Entity comment ID.',
      required: true,
    }),
  }

  static description = 'Update an entity comment.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(EntityCommentsUpdate)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.patch(this.companyApiPath('/v1/companies/{companyId}/entity-comments/comments/{id}', settings, args), {
      body: await readRequiredJsonBodyFile(flags['body-file']),
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
