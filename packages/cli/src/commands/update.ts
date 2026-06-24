import {Flags} from '@oclif/core'
import {homedir} from 'node:os'
import {resolve} from 'node:path'

import {BaseCommand} from '../base-command.js'
import {OperoCliError} from '../api/errors.js'
import {fetchRelease, findChecksumsAsset, findReleaseAsset} from '../update/github.js'
import {installUpdate} from '../update/install.js'
import {currentInstallLayout} from '../update/platform.js'

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
      target: string
      updateAvailable: boolean
      updated: boolean
    }
  }> {
    const {flags} = await this.parse(Update)
    const layout = currentInstallLayout()
    const release = await fetchRelease(flags.repo, flags.version)
    const asset = findReleaseAsset(release, layout.target)
    const checksums = findChecksumsAsset(release)
    const currentVersion = `v${this.config.version}`
    const updateAvailable = release.tag_name !== currentVersion

    if (flags.check) {
      const result = {
        data: {
          asset: asset.name,
          currentVersion,
          latestVersion: release.tag_name,
          target: layout.target,
          updateAvailable,
          updated: false,
        },
      }

      if (!this.jsonEnabled()) this.printHuman(result)
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
    const install = await installUpdate({
      asset,
      binDir,
      checksums,
      installDir,
      layout,
      tag: release.tag_name,
    })

    const result = {
      data: {
        asset: asset.name,
        currentVersion,
        installPath: install.installPath,
        latestVersion: release.tag_name,
        target: layout.target,
        updateAvailable,
        updated: true,
      },
    }

    if (!this.jsonEnabled()) {
      this.log(`Installed opero ${release.tag_name}`)
      this.log(`Binary: ${install.executable}`)
    }

    return result
  }
}

function isSourceCheckout(): boolean {
  const argvPath = process.argv[1] ?? ''
  return argvPath.includes('/packages/cli/bin/') || argvPath.includes('\\packages\\cli\\bin\\')
}
