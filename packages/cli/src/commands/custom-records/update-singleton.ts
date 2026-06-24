import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class CustomRecordsUpdateSingleton extends WriteCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
    objectKey: Args.string({
      description: 'Custom singleton object key.',
      required: true,
    }),
  }

  static description = 'Update a singleton custom record.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomRecordsUpdateSingleton)
    return this.patchJson(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/record', args), flags)
  }
}
