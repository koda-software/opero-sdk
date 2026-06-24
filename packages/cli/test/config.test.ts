import {describe, expect, it} from 'vitest'

import {resolveSettings} from '../src/config/load.js'

describe('resolveSettings', () => {
  it('prefers flags over environment and config', () => {
    const settings = resolveSettings({
      config: {
        apiToken: 'config-token',
        baseUrl: 'https://config.example',
        timeoutMs: 1,
      },
      configPath: '/tmp/config.json',
      env: {
        OPERO_API_TOKEN: 'env-token',
        OPERO_BASE_URL: 'https://env.example',
        OPERO_TIMEOUT_MS: '2',
      },
      flags: {
        'api-token': 'flag-token',
        'base-url': 'https://flag.example/',
        'timeout-ms': 3,
      },
    })

    expect(settings).toMatchObject({
      apiToken: 'flag-token',
      authSource: 'flag',
      baseUrl: 'https://flag.example',
      timeoutMs: 3,
    })
  })

  it('falls back to env before config', () => {
    const settings = resolveSettings({
      config: {
        apiToken: 'config-token',
        baseUrl: 'https://config.example',
      },
      configPath: '/tmp/config.json',
      env: {
        OPERO_API_TOKEN: 'env-token',
        OPERO_BASE_URL: 'https://env.example',
      },
      flags: {},
    })

    expect(settings.authSource).toBe('env')
    expect(settings.apiToken).toBe('env-token')
    expect(settings.baseUrl).toBe('https://env.example')
  })
})
