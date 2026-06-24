import {Flags} from '@oclif/core'

import {ReadCommand} from '../../read-command.js'

export default class RulesStepTypes extends ReadCommand {
  static description = 'Search rule step types.'
  static enableJsonFlag = true
  static flags = {
    category: Flags.string({
      description: 'Step category filter.',
    }),
    limit: Flags.integer({
      description: 'Items per page.',
      min: 1,
    }),
    page: Flags.integer({
      description: 'Page number, 1-based.',
      min: 1,
    }),
    search: Flags.string({
      description: 'Search text.',
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(RulesStepTypes)
    return this.getJson('/v1/rules/step-types', flags, {
      category: flags.category,
      limit: flags.limit,
      page: flags.page,
      search: flags.search,
    })
  }
}
