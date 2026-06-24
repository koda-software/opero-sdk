import {InstallSkillsCommand, installSkillFlags} from './shared.js'

export default class SkillsInstallClaude extends InstallSkillsCommand {
  static description = 'Install bundled Opero agent skills for Claude.'
  static enableJsonFlag = true
  static flags = installSkillFlags

  async run(): Promise<unknown> {
    return this.installForPlatform(SkillsInstallClaude, 'claude')
  }
}
