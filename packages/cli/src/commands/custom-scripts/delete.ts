import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class CustomScriptsDelete extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Custom script ID.',
      required: true,
    }),
  }

  static description = 'Delete a custom script immediately.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomScriptsDelete)
    return this.deleteJson(apiPath('/v1/custom-scripts/{id}', args), flags)
  }
}
