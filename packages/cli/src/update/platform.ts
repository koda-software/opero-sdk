import {platform, arch} from 'node:process'

import {OperoCliError} from '../api/errors.js'

export type InstallLayout = {
  executableRelativePath: string
  target: string
}

export function currentInstallLayout(): InstallLayout {
  const os = platform
  const cpu = arch

  if (os === 'linux' && cpu === 'x64') {
    return {executableRelativePath: 'opero/bin/opero', target: 'linux-x64'}
  }

  if (os === 'darwin' && cpu === 'x64') {
    return {executableRelativePath: 'opero/bin/opero', target: 'darwin-x64'}
  }

  if (os === 'darwin' && cpu === 'arm64') {
    return {executableRelativePath: 'opero/bin/opero', target: 'darwin-arm64'}
  }

  if (os === 'win32' && cpu === 'x64') {
    return {executableRelativePath: 'opero/bin/opero.cmd', target: 'win32-x64'}
  }

  throw new OperoCliError({
    code: 'UNSUPPORTED_PLATFORM',
    exitCode: 2,
    message: `Unsupported platform: ${os}-${cpu}`,
  })
}
