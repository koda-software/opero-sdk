import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class CustomRecordsUpdate extends WriteCommand {
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

  static description = 'Update a custom record.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomRecordsUpdate)
    return this.patchJson(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/records/{recordId}', args), flags)
  }
}
