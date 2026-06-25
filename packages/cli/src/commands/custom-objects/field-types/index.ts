import {ReadCommand} from '../../../read-command.js'

export default class CustomObjectsFieldTypes extends ReadCommand {
  static description = 'List dynamic object field type schemas.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {flags} = await this.parse(CustomObjectsFieldTypes)
    return this.getJson('/v1/custom-modules/field-types', flags)
  }
}
