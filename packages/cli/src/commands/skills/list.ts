import {BaseCommand} from '../../base-command.js'
import {listAvailableSkills} from '../../skills/source.js'

export default class SkillsList extends BaseCommand {
  static description = 'List bundled Opero agent skills.'
  static enableJsonFlag = true

  async run(): Promise<{data: Array<{description: string; name: string; path: string}>}> {
    const {flags} = await this.parse(SkillsList)
    const result = {
      data: await listAvailableSkills(),
    }

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}
