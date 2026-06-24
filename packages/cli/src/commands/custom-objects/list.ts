import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {listFlags, ListCommand} from '../../list-command.js'

export default class CustomObjectsList extends ListCommand {
  static args = {
    moduleKey: Args.string({
      description: 'Custom module key.',
      required: true,
    }),
  }

  static description = 'List custom objects in a module.'
  static enableJsonFlag = true
  static flags = listFlags

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomObjectsList)
    return this.getList(apiPath('/v1/custom-modules/{moduleKey}/objects', args), flags)
  }
}
