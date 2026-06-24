import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class CustomModulesCreate extends WriteCommand {
  static description = 'Create a custom module.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(CustomModulesCreate)
    return this.postJson('/v1/custom-modules', flags)
  }
}
