import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../../../api/path.js'
import {ReadCommand} from '../../../../read-command.js'

export default class ViewLayoutsDraftStagedFieldDefinitionsOptions extends ReadCommand {
  static args = {
    layoutId: Args.string({
      description: 'View layout ID.',
      required: true,
    }),
    draftFieldDefinitionId: Args.string({
      description: 'Staged custom-field draft ID.',
      required: true,
    }),
  }

  static description = 'Get staged field options for a view layout draft.'
  static enableJsonFlag = true
  static flags = {
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
    const {args, flags} = await this.parse(ViewLayoutsDraftStagedFieldDefinitionsOptions)
    return this.getJson(apiPath('/v1/view-layouts/{layoutId}/draft/staged-field-definitions/{draftFieldDefinitionId}/options', args), flags, {
      limit: flags.limit,
      page: flags.page,
      search: flags.search,
    })
  }
}
