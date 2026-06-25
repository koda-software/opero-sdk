import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class ViewLayoutsRuntimeContextVariables extends ReadCommand {
  static args = {
    layoutId: Args.string({
      description: 'View layout ID.',
      required: true,
    }),
  }

  static description = 'Get view layout runtime context variables.'
  static enableJsonFlag = true
  static flags = {
    'entity-id': Flags.string({
      description: 'Built-in entity ID.',
    }),
    mode: Flags.string({
      description: 'Runtime mode.',
      options: ['VIEW', 'EDIT', 'CREATE', 'WORKSPACE'],
    }),
    'record-id': Flags.string({
      description: 'Dynamic object record ID.',
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(ViewLayoutsRuntimeContextVariables)
    return this.getJson(apiPath('/v1/view-layouts/{layoutId}/runtime-context-variables', args), flags, {
      entityId: flags['entity-id'],
      mode: flags.mode,
      recordId: flags['record-id'],
    })
  }
}
