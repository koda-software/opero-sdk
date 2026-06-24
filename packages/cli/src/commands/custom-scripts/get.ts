import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class CustomScriptsGet extends ReadCommand {
  static args = {
    id: Args.string({
      description: 'Custom script ID.',
      required: true,
    }),
  }

  static description = 'Get one custom script.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomScriptsGet)
    return this.getJson(apiPath('/v1/custom-scripts/{id}', args), flags)
  }
}
