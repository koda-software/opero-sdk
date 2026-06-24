import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class CustomRecordsDelete extends WriteCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
    objectKey: Args.string({
      description: 'Custom object key.',
      required: true,
    }),
    recordId: Args.string({
      description: 'Custom record ID.',
      required: true,
    }),
  }

  static description = 'Delete a custom record immediately.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomRecordsDelete)
    return this.deleteJson(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/records/{recordId}', args), flags)
  }
}
