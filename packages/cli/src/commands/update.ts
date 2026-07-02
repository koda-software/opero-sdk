import {Flags} from '@oclif/core'
import {homedir} from 'node:os'
import {resolve} from 'node:path'
import pc from 'picocolors'

import {BaseCommand} from '../base-command.js'
import {OperoCliError} from '../api/errors.js'
import {fetchRelease, findChecksumsAsset, findReleaseAsset} from '../update/github.js'
import {installUpdate} from '../update/install.js'
import {currentInstallLayout} from '../update/platform.js'
import {isSourceCheckout} from '../update/source-checkout.js'
import {formatSkillInstallTarget, reinstallManagedSkillInstalls, type ReinstallSkillInstallResult} from '../skills/registry.js'

export default class Update extends BaseCommand {
  static description = 'Update standalone Opero CLI from GitHub Releases.'
  static enableJsonFlag = true
  static flags = {
    'bin-dir': Flags.string({
      description: 'Directory where opero should be linked or shimmed.',
    }),
    check: Flags.boolean({
      description: 'Only check whether the requested release is newer.',
    }),
    force: Flags.boolean({
      description: 'Allow update even when running from a source checkout.',
    }),
    'install-dir': Flags.string({
      description: 'Directory where standalone versions are installed.',
    }),
    repo: Flags.string({
      default: 'koda-software/opero-sdk',
      description: 'GitHub repository that publishes Opero CLI releases.',
    }),
    version: Flags.string({
      default: 'latest',
      description: 'Release tag to install, or latest.',
    }),
  }

  async run(): Promise<{
    data: {
      asset: string
      currentVersion: string
      installPath?: string
      latestVersion: string
      skillInstalls: ReinstallSkillInstallResult[]
      target: string
      updateAvailable: boolean
      updated: boolean
    }
  }> {
    const {flags} = await this.parse(Update)
    const progress = createProgress(this.jsonEnabled())
    const layout = currentInstallLayout()
    progress(`Checking GitHub Releases for ${flags.repo}`)
    const release = await fetchRelease(flags.repo, flags.version)
    progress(`Found ${release.tag_name}`)
    const asset = findReleaseAsset(release, layout.target)
    const checksums = findChecksumsAsset(release)
    const currentVersion = `v${this.config.version}`
    const updateAvailable = release.tag_name !== currentVersion
    progress(`Selected ${asset.name}`)

    if (flags.check) {
      const result = {
        data: {
          asset: asset.name,
          currentVersion,
          latestVersion: release.tag_name,
          skillInstalls: [],
          target: layout.target,
          updateAvailable,
          updated: false,
        },
      }

      if (!this.jsonEnabled()) {
        if (updateAvailable) {
          this.log(`${pc.cyan('Update available')}: ${release.tag_name} ${pc.dim(`(current ${currentVersion})`)}`)
          this.log(`Run ${pc.bold('opero update')} to install it.`)
        } else {
          this.log(`${pc.green('Already up to date')}: ${currentVersion}`)
        }
      }

      return result
    }

    if (isSourceCheckout() && !flags.force) {
      throw new OperoCliError({
        code: 'UPDATE_SOURCE_CHECKOUT',
        exitCode: 2,
        message: 'Refusing to update a source checkout. Re-run with --force or use pnpm install-local.',
      })
    }

    const installDir = resolve(flags['install-dir'] ?? process.env.OPERO_INSTALL_DIR ?? resolve(homedir(), '.local/share/opero-cli'))
    const binDir = resolve(flags['bin-dir'] ?? process.env.OPERO_BIN_DIR ?? resolve(homedir(), '.local/bin'))
    if (!updateAvailable) progress(`Reinstalling ${currentVersion}`)
    const install = await installUpdate({
      asset,
      binDir,
      checksums,
      installDir,
      layout,
      onProgress: progress,
      tag: release.tag_name,
    })
    const skillInstalls = await reinstallManagedSkillInstalls({
      configDir: this.config.configDir,
      cwd: process.cwd(),
      executable: install.executable,
      onProgress: progress,
    })

    const result = {
      data: {
        asset: asset.name,
        currentVersion,
        installPath: install.installPath,
        latestVersion: release.tag_name,
        skillInstalls,
        target: layout.target,
        updateAvailable,
        updated: true,
      },
    }

    if (!this.jsonEnabled()) {
      this.log(`Installed opero ${release.tag_name}`)
      this.log(`Binary: ${install.executable}`)
      this.printSkillInstallResult(skillInstalls)
    }

    return result
  }

  private printSkillInstallResult(skillInstalls: ReinstallSkillInstallResult[]): void {
    if (skillInstalls.length === 0) return

    const refreshed = skillInstalls.filter((target) => target.status === 'refreshed')
    const failed = skillInstalls.filter((target) => target.status === 'failed')
    if (refreshed.length > 0) {
      this.log(`Skills: refreshed ${refreshed.length} install target${refreshed.length === 1 ? '' : 's'}`)
      for (const target of refreshed) {
        this.log(`${pc.dim('-')} ${pc.cyan(formatSkillInstallTarget(target))} ${pc.dim(target.targetDir)}`)
      }
    }

    if (failed.length > 0) {
      this.log(pc.yellow(`Skills: ${failed.length} install target${failed.length === 1 ? '' : 's'} could not be refreshed`))
      for (const target of failed) {
        this.log(`${pc.dim('-')} ${pc.cyan(formatSkillInstallTarget(target))} ${pc.dim(target.targetDir)} ${pc.yellow(target.error ?? '')}`)
      }
    }
  }
}

function createProgress(jsonEnabled: boolean): (message: string) => void {
  return (message: string) => {
    if (!jsonEnabled) process.stderr.write(`${pc.dim('->')} ${message}\n`)
  }
}
