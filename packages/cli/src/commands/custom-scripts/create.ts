import {bodyFileFlag, WriteCommand} from '../../write-command.js'

export default class CustomScriptsCreate extends WriteCommand {
  static description = 'Create a custom script.'
  static enableJsonFlag = true
  static flags = bodyFileFlag

  async run(): Promise<unknown> {
    const {flags} = await this.parse(CustomScriptsCreate)
    return this.postJson('/v1/custom-scripts', flags)
  }
}
