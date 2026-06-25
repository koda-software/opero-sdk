import {Flags} from '@oclif/core'

import {listFlags, ListCommand} from '../../list-command.js'

export default class QueriesList extends ListCommand {
  static description = 'List saved queries. SQL body is omitted from list items.'
  static enableJsonFlag = true
  static flags = {
    ...listFlags,
    scope: Flags.string({
      description: 'Filter by query scope.',
      options: ['SYSTEM', 'ORGANIZATION'],
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(QueriesList)
    return this.getList('/v1/saved-queries', flags, {scope: flags.scope})
  }
}
