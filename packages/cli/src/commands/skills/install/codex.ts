import {InstallSkillsCommand, installSkillFlags} from './shared.js'

export default class SkillsInstallCodex extends InstallSkillsCommand {
  static description = 'Install bundled Opero agent skills for Codex.'
  static enableJsonFlag = true
  static flags = installSkillFlags

  async run(): Promise<unknown> {
    return this.installForPlatform(SkillsInstallCodex, 'codex')
  }
}
