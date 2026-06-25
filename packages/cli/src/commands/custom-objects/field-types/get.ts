import {Args} from '@oclif/core'

import {apiPath} from '../../../api/path.js'
import {ReadCommand} from '../../../read-command.js'

export default class CustomObjectsFieldTypesGet extends ReadCommand {
  static args = {
    type: Args.string({
      description: 'Dynamic object field type, for example SELECT, REFERENCE, or CURRENCY.',
      required: true,
    }),
  }

  static description = 'Get one dynamic object field type schema.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {args, flags} = await this.parse(CustomObjectsFieldTypesGet)
    return this.getJson(apiPath('/v1/custom-modules/field-types/{type}', args), flags)
  }
}
