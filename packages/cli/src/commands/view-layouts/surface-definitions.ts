import {Flags} from '@oclif/core'

import {ReadCommand} from '../../read-command.js'

export default class ViewLayoutsSurfaceDefinitions extends ReadCommand {
  static description = 'Get view layout surface definitions.'
  static enableJsonFlag = true
  static flags = {
    surface: Flags.string({
      description: 'View layout surface.',
      options: ['DYNAMIC_OBJECT', 'CONTRACTOR', 'ORGANIZATION', 'SALES_INVOICE', 'COST_INVOICE', 'DASHBOARD', 'USER'],
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ViewLayoutsSurfaceDefinitions)
    return this.getJson('/v1/view-layouts/surface-definitions', flags, {surface: flags.surface})
  }
}
