import {Args, Flags} from '@oclif/core'

import {apiPath} from '../../api/path.js'
import {ReadCommand} from '../../read-command.js'

export default class RulesContextSchema extends ReadCommand {
  static args = {
    id: Args.string({
      description: 'Rule ID.',
      required: true,
    }),
  }

  static description = 'Get context schema before a saved rule step.'
  static enableJsonFlag = true
  static flags = {
    'step-position': Flags.integer({
      description: 'Saved rule step position.',
      min: 0,
      required: true,
    }),
  }

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(RulesContextSchema)
    return this.getJson(apiPath('/v1/rules/{id}/context-schema', args), flags, {
      stepPosition: flags['step-position'],
    })
  }
}
