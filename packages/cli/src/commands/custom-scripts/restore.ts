import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {WriteCommand} from '../../write-command.js'

export default class CustomScriptsRestore extends WriteCommand {
  static args = {
    id: Args.string({
      description: 'Custom script ID.',
      required: true,
    }),
  }

  static description = 'Restore an archived custom script.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomScriptsRestore)
    return this.patchNoBody(apiPath('/v1/custom-scripts/{id}/restore', args), flags)
  }
}
