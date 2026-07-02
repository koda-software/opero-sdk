import {Flags, type Interfaces} from '@oclif/core'
import pc from 'picocolors'

import {BaseCommand} from '../../../base-command.js'
import {installBundledSkills, type InstallSkillsResult} from '../../../skills/install.js'
import type {SkillPlatform, SkillScope} from '../../../skills/platforms.js'
import {recordSkillInstall} from '../../../skills/registry.js'

export const installSkillFlags = {
  'dry-run': Flags.boolean({
    description: 'Show what would be installed without writing files.',
  }),
  force: Flags.boolean({
    description: 'Overwrite existing non-Opero-managed skill folders.',
  }),
  scope: Flags.string({
    default: 'user',
    description: 'Install scope.',
    options: ['user', 'repo'],
  }),
  'target-dir': Flags.string({
    description: 'Explicit directory where skill folders should be installed.',
  }),
}

type InstallFlags = Interfaces.InferredFlags<typeof installSkillFlags>

export abstract class InstallSkillsCommand extends BaseCommand {
  protected async installForPlatform(command: typeof InstallSkillsCommand, platform: SkillPlatform): Promise<unknown> {
    const {flags} = await this.parse(command)
    const result = await installBundledSkills({
      dryRun: flags['dry-run'],
      force: flags.force,
      operoCliVersion: this.config.version,
      platform,
      scope: flags.scope as SkillScope,
      targetDir: flags['target-dir'],
    })

    await recordSkillInstall(this.config.configDir, result.data)
    if (!this.jsonEnabled()) this.printInstallResult(result)
    return result
  }

  private printInstallResult(result: InstallSkillsResult): void {
    const installed = result.data.skills.filter((skill) => ['installed', 'updated', 'would-install', 'would-update'].includes(skill.action))
    const conflicts = result.data.skills.filter((skill) => skill.action === 'conflict')
    const skipped = result.data.skills.filter((skill) => skill.action === 'skipped')
    const verb = result.data.dryRun ? 'Would install' : 'Installed'
    const changedCount = installed.length

    this.log(`${pc.cyan(verb)} ${changedCount} Opero skill${changedCount === 1 ? '' : 's'} for ${formatPlatform(result.data.platform)}`)
    this.log(pc.dim(`Target: ${result.data.targetDir}`))

    for (const skill of result.data.skills) {
      const action = formatAction(skill.action)
      this.log(`${pc.dim('-')} ${pc.cyan(skill.name)} ${pc.dim(action)} ${skill.targetPath}`)
    }

    if (skipped.length > 0) {
      this.log(pc.dim(`${skipped.length} skill${skipped.length === 1 ? '' : 's'} already up to date.`))
    }

    if (conflicts.length > 0) {
      this.log(pc.yellow(`${conflicts.length} conflict${conflicts.length === 1 ? '' : 's'} skipped. Re-run with --force to overwrite unmanaged skill folders.`))
    }
  }
}

function formatPlatform(platform: SkillPlatform): string {
  return platform === 'codex' ? 'Codex' : 'Claude'
}

function formatAction(action: string): string {
  switch (action) {
    case 'conflict': {
      return 'conflict at'
    }

    case 'installed': {
      return 'installed to'
    }

    case 'skipped': {
      return 'already up to date at'
    }

    case 'updated': {
      return 'updated at'
    }

    case 'would-install': {
      return 'would install to'
    }

    case 'would-update': {
      return 'would update at'
    }

    default: {
      return `${action} at`
    }
  }
}
