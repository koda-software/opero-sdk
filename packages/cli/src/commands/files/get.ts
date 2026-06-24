import {Args} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class FilesGet extends ReadCommand {
  static args = {
    id: Args.string({
      description: 'File ID.',
      required: true,
    }),
  }

  static description = 'Get file metadata.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(FilesGet)
    return this.getJson(apiPath('/v1/files/{id}', args), flags)
  }
}
