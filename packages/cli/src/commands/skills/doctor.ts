import pc from 'picocolors'

import {BaseCommand} from '../../base-command.js'
import {checkSkills, type SkillDoctorResult, type SkillInstallStatus} from '../../skills/doctor.js'

export default class SkillsDoctor extends BaseCommand {
  static description = 'Inspect installed Opero agent skills.'
  static enableJsonFlag = true

  async run(): Promise<SkillDoctorResult> {
    await this.parse(SkillsDoctor)
    const result = await checkSkills({
      operoCliVersion: this.config.version,
    })

    if (!this.jsonEnabled()) this.printDoctorResult(result)
    return result
  }

  private printDoctorResult(result: SkillDoctorResult): void {
    this.log(pc.cyan(pc.bold('Opero agent skills')))
    this.log('')
    this.log(pc.bold('Bundled'))
    for (const skill of result.data.bundled) {
      this.log(`${pc.dim('-')} ${pc.cyan(skill.name)}`)
    }

    for (const target of result.data.targets) {
      this.log('')
      this.log(`${pc.bold(formatPlatform(target.platform))} ${target.scope}`)
      this.log(pc.dim(`Target: ${target.targetDir}`))
      for (const skill of target.skills) {
        this.log(`${pc.dim('-')} ${pc.cyan(skill.name)} ${formatStatus(skill.status)}${formatVersion(skill.installedVersion)}`)
        if (skill.status !== 'current') {
          this.log(`  ${pc.dim('Run:')} ${skill.command}`)
        }
      }
    }
  }
}

function formatPlatform(platform: string): string {
  return platform === 'codex' ? 'Codex' : 'Claude'
}

function formatStatus(status: SkillInstallStatus): string {
  switch (status) {
    case 'conflict': {
      return pc.yellow('conflict')
    }

    case 'current': {
      return pc.green('current')
    }

    case 'missing': {
      return pc.yellow('missing')
    }

    case 'outdated': {
      return pc.yellow('outdated')
    }
  }
}

function formatVersion(version: string | undefined): string {
  return version ? pc.dim(` (${version})`) : ''
}
