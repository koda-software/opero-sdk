import {OperoCliError} from '../api/errors.js'

export type ReleaseAsset = {
  browser_download_url: string
  name: string
}

export type GitHubRelease = {
  assets: ReleaseAsset[]
  html_url?: string
  tag_name: string
}

export async function fetchRelease(repo: string, version: string, options: {signal?: AbortSignal} = {}): Promise<GitHubRelease> {
  const endpoint =
    version === 'latest'
      ? `https://api.github.com/repos/${repo}/releases/latest`
      : `https://api.github.com/repos/${repo}/releases/tags/${version}`

  const response = await fetch(endpoint, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'opero-cli-updater',
    },
    signal: options.signal,
  })

  if (!response.ok) {
    throw new OperoCliError({
      code: 'UPDATE_RELEASE_NOT_FOUND',
      exitCode: 5,
      message: `Could not fetch release ${version} from ${repo}: HTTP ${response.status}`,
      status: response.status,
    })
  }

  return (await response.json()) as GitHubRelease
}

export function findReleaseAsset(release: GitHubRelease, target: string): ReleaseAsset {
  const asset = release.assets.find((item) => item.name.endsWith(`-${target}.tar.gz`))
  if (!asset) {
    throw new OperoCliError({
      code: 'UPDATE_ASSET_NOT_FOUND',
      exitCode: 5,
      message: `Release ${release.tag_name} does not contain a ${target} tarball`,
    })
  }

  return asset
}

export function findChecksumsAsset(release: GitHubRelease): ReleaseAsset {
  const asset = release.assets.find((item) => item.name === 'checksums.txt')
  if (!asset) {
    throw new OperoCliError({
      code: 'UPDATE_CHECKSUMS_NOT_FOUND',
      exitCode: 5,
      message: `Release ${release.tag_name} does not contain checksums.txt`,
    })
  }

  return asset
}
