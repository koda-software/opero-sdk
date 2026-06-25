import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {BaseCommand} from '../../../base-command.js'
import {writeDownloadFile} from '../../../files/io.js'

export default class DictionariesEntriesExport extends BaseCommand {
  static args = {
    dictionaryId: Args.string({
      description: 'Dictionary ID.',
      required: true,
    }),
  }

  static description = 'Export dictionary entries to a JSON or CSV file.'
  static enableJsonFlag = true
  static flags = {
    'create-dirs': Flags.boolean({
      description: 'Create parent directories for --out.',
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Overwrite --out if it already exists.',
    }),
    format: Flags.string({
      default: 'json',
      description: 'Export file format.',
      options: ['json', 'csv'],
    }),
    out: Flags.string({
      char: 'o',
      description: 'Output file path.',
      required: true,
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(DictionariesEntriesExport)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const response = await client.download(apiPath('/v1/dictionaries/{dictionaryId}/entries/export', args), {
      headers: {
        accept: flags.format === 'csv' ? 'text/csv' : 'application/json',
      },
      query: {
        format: flags.format,
      },
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
        dictionaryId: args.dictionaryId,
        format: flags.format,
        out: flags.out,
        status: response.status,
      },
    }

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
