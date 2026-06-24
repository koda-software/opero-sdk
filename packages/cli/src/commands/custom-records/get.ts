import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class CustomRecordsGet extends ReadCommand {
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

  static description = 'Get one custom record.'
  static enableJsonFlag = true
  static flags = {
    expand: Flags.string({
      description: 'Comma-separated expandable field keys.',
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomRecordsGet)
    return this.getJson(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/records/{recordId}', args), flags, {
      expand: flags.expand,
    })
  }
}
