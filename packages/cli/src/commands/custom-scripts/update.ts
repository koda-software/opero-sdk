import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class CustomScriptsUpdate extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Custom script ID.',
      required: true,
    }),
  }

  static description = 'Update a custom script.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomScriptsUpdate)
    return this.patchJson(apiPath('/v1/custom-scripts/{id}', args), flags)
  }
}
