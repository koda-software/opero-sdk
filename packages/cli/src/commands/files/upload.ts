import {Flags} from '@oclif/core'
import {basename} from 'node:path'

import {readUploadFile} from '../../files/io.js'
import {BaseCommand} from '../../base-command.js'

export default class FilesUpload extends BaseCommand {
  static description = 'Upload an attachment file.'
  static enableJsonFlag = true
  static flags = {
    file: Flags.string({
      description: 'Local file path to upload.',
      required: true,
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(FilesUpload)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.postMultipart('/v1/files/attachments', {
      bytes: await readUploadFile(flags.file),
      fieldName: 'file',
      filename: basename(flags.file),
    })

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
