import {mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vitest'

import {checkForUpdateNotice, shouldCheckForUpdates} from '../src/update/background.js'

describe('background update checks', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('skips script and CI contexts', () => {
    expect(
      shouldCheckForUpdates({
        commandId: 'currencies:list',
        configDir: '/tmp/opero',
        currentVersion: 'v0.2.2',
        jsonEnabled: true,
      }),
    ).toBe(false)

    expect(
      shouldCheckForUpdates({
        commandId: 'currencies:list',
        configDir: '/tmp/opero',
        currentVersion: 'v0.2.2',
        env: {CI: '1'},
        jsonEnabled: false,
      }),
    ).toBe(false)

    expect(
      shouldCheckForUpdates({
        commandId: 'update',
        configDir: '/tmp/opero',
        currentVersion: 'v0.2.2',
        jsonEnabled: false,
      }),
    ).toBe(false)
  })

  it('returns an update notice when latest release is newer and has a target asset', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-update-check-'))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(releaseResponse('v0.2.3')))

    const notice = await checkForUpdateNotice({
      commandId: 'currencies:list',
      configDir: dir,
      currentVersion: 'v0.2.2',
      jsonEnabled: false,
      now: new Date('2026-06-24T10:00:00Z'),
    })

    expect(notice).toEqual({
      currentVersion: 'v0.2.2',
      latestVersion: 'v0.2.3',
      target: 'linux-x64',
    })
    expect(await readFile(join(dir, 'update-check.json'), 'utf8')).toContain('2026-06-24T10:00:00.000Z')
    await rm(dir, {force: true, recursive: true})
  })

  it('debounces repeated checks', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'opero-update-check-'))
    const fetch = vi.fn().mockResolvedValue(releaseResponse('v0.2.3'))
    vi.stubGlobal('fetch', fetch)

    await checkForUpdateNotice({
      commandId: 'currencies:list',
      configDir: dir,
      currentVersion: 'v0.2.2',
      jsonEnabled: false,
      now: new Date('2026-06-24T10:00:00Z'),
    })
    const second = await checkForUpdateNotice({
      commandId: 'currencies:list',
      configDir: dir,
      currentVersion: 'v0.2.2',
      jsonEnabled: false,
      now: new Date('2026-06-24T10:05:00Z'),
    })

    expect(second).toBeUndefined()
    expect(fetch).toHaveBeenCalledTimes(1)
    await rm(dir, {force: true, recursive: true})
  })
})

function releaseResponse(tag: string) {
  return {
    json: async () => ({
      assets: [
        {
          browser_download_url: `https://example.test/${tag}/opero-linux.tar.gz`,
          name: `opero-${tag}-abcdef0-linux-x64.tar.gz`,
        },
      ],
      tag_name: tag,
    }),
    ok: true,
  }
}
