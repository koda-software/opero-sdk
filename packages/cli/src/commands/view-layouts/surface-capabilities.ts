import {ReadCommand} from '../../read-command.js'

export default class ViewLayoutsSurfaceCapabilities extends ReadCommand {
  static description = 'Get view layout surface capabilities.'
  static enableJsonFlag = true

  async run(): Promise<unknown> {
    const {flags} = await this.parse(ViewLayoutsSurfaceCapabilities)
    return this.getJson('/v1/view-layouts/surface-capabilities', flags)
  }
}
