import {ReadCommand} from '../../read-command.js'

export default class ViewLayoutsCustomFieldTypes extends ReadCommand {
  static description = 'Get view layout custom-field type schemas.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ViewLayoutsCustomFieldTypes)
    return this.getJson('/v1/view-layouts/custom-field-types', flags)
  }
}
