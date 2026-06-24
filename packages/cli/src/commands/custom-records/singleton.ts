import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class CustomRecordsSingleton extends ReadCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
    objectKey: Args.string({
      description: 'Custom object key.',
      required: true,
    }),
  }

  static description = 'Get singleton custom record.'
  static enableJsonFlag = true
  static flags = {
    expand: Flags.string({
      description: 'Comma-separated expandable field keys.',
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomRecordsSingleton)
    return this.getJson(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/record', args), flags, {
      expand: flags.expand,
    })
  }
}
