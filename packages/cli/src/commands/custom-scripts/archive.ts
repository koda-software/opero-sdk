import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class CustomScriptsArchive extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Custom script ID.',
      required: true,
    }),
  }

  static description = 'Archive a custom script.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomScriptsArchive)
    return this.patchNoBody(apiPath('/v1/custom-scripts/{id}/archive', args), flags)
  }
}
