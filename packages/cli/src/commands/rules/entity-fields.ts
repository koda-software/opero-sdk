import {Flags} from '@oclif/core'

import {ReadCommand} from '../../read-command.js'

export default class RulesEntityFields extends ReadCommand {
  static description = 'Get fields available for a rule entity type.'
  static enableJsonFlag = true
  static flags = {
    'entity-type': Flags.string({
      description: 'Entity type, for example contractor or custom_record.',
      required: true,
    }),
    'module-key': Flags.string({
      description: 'Custom module key for custom entities.',
    }),
    'object-key': Flags.string({
      description: 'Custom object key for custom entities.',
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(RulesEntityFields)
    return this.getJson('/v1/rules/entity-fields', flags, {
      entityType: flags['entity-type'],
      moduleKey: flags['module-key'],
      objectKey: flags['object-key'],
    })
  }
}
