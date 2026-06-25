import {Args, Flags} from '@oclif/core'
import {basename} from 'node:path'

import {apiPath} from '../../../api/path.js'
import {BaseCommand} from '../../../base-command.js'
import {readUploadFile} from '../../../files/io.js'

export default class DictionariesEntriesImport extends BaseCommand {
  static args = {
    dictionaryId: Args.string({
      description: 'Dictionary ID.',
      required: true,
    }),
  }

  static description = 'Import dictionary entries from a JSON or CSV file.'
  static enableJsonFlag = true
  static flags = {
    file: Flags.string({
      description: 'Local JSON or CSV file to import.',
      required: true,
    }),
    strategy: Flags.string({
      default: 'MERGE',
      description: 'Import strategy.',
      options: ['MERGE', 'REPLACE'],
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(DictionariesEntriesImport)
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.postMultipart(
      apiPath('/v1/dictionaries/{dictionaryId}/entries/import', args),
      {
        bytes: await readUploadFile(flags.file),
        fieldName: 'file',
        filename: basename(flags.file),
      },
      {
        fields: {
          strategy: flags.strategy,
        },
      },
    )

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
