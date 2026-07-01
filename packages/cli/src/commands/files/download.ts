import {Args, Flags} from '@oclif/core'

import {BaseCommand} from '../../base-command.js'
import {writeDownloadFile} from '../../files/io.js'

export default class FilesDownload extends BaseCommand {
  static args = {
    id: Args.string({
      description: 'File ID.',
      required: true,
    }),
  }

  static description = 'Download file bytes to disk.'
  static enableJsonFlag = true
  static flags = {
    'create-dirs': Flags.boolean({
      description: 'Create parent directories for --out.',
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Overwrite --out if it already exists.',
    }),
    out: Flags.string({
      char: 'o',
      description: 'Output file path.',
      required: true,
    }),
    range: Flags.string({
      description: 'HTTP byte range, for example bytes=0-1023.',
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(FilesDownload)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const response = await client.download(this.companyApiPath('/v1/companies/{companyId}/files/{id}/download', settings, args), {
      headers: flags.range ? {Range: flags.range} : undefined,
    })

    await writeDownloadFile(flags.out, response.body, {
      createDirs: flags['create-dirs'],
      force: flags.force,
    })

    const result = {
      data: {
        contentDisposition: response.headers.get('content-disposition'),
        contentLength: response.headers.get('content-length'),
        contentType: response.headers.get('content-type'),
        id: args.id,
        out: flags.out,
        status: response.status,
      },
    }

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
