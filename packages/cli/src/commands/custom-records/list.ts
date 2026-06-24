import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {listFlags, ListCommand} from '../../list-command.js'

export default class CustomRecordsList extends ListCommand {
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

  static description = 'List custom records.'
  static enableJsonFlag = true
  static flags = {
    ...listFlags,
    expand: Flags.string({
      description: 'Comma-separated expandable field keys.',
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomRecordsList)
    return this.getList(apiPath('/v1/custom-modules/{moduleKey}/objects/{objectKey}/records', args), flags, {expand: flags.expand})
  }
}
