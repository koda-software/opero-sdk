import {describe, expect, it} from 'vitest'

import {resolveSettings} from '../src/config/load.js'

describe('resolveSettings', () => {
  it('prefers flags over environment and config', () => {
    const settings = resolveSettings({
      config: {
        apiToken: 'config-token',
        baseUrl: 'https://config.example',
        companyId: 'config-company',
        timeoutMs: 1,
      },
      configPath: '/tmp/config.json',
      env: {
        OPERO_API_TOKEN: 'env-token',
        OPERO_BASE_URL: 'https://env.example',
        OPERO_COMPANY_ID: 'env-company',
        OPERO_TIMEOUT_MS: '2',
      },
      flags: {
        'api-token': 'flag-token',
        'base-url': 'https://flag.example/',
        'company-id': 'flag-company',
        'timeout-ms': 3,
      },
    })

    expect(settings).toMatchObject({
      apiToken: 'flag-token',
      authSource: 'flag',
      baseUrl: 'https://flag.example',
      companyId: 'flag-company',
      timeoutMs: 3,
    })
  })

  it('falls back to env before config', () => {
    const settings = resolveSettings({
      config: {
        apiToken: 'config-token',
        baseUrl: 'https://config.example',
        companyId: 'config-company',
      },
      configPath: '/tmp/config.json',
      env: {
        OPERO_API_TOKEN: 'env-token',
        OPERO_BASE_URL: 'https://env.example',
        OPERO_COMPANY_ID: 'env-company',
      },
      flags: {},
    })

    expect(settings.authSource).toBe('env')
    expect(settings.apiToken).toBe('env-token')
    expect(settings.baseUrl).toBe('https://env.example')
    expect(settings.companyId).toBe('env-company')
  })

  it('uses saved company id when flag and env are absent', () => {
    const settings = resolveSettings({
      config: {
        baseUrl: 'https://config.example',
        companyId: 'config-company',
      },
      configPath: '/tmp/config.json',
      env: {},
      flags: {},
    })

    expect(settings.companyId).toBe('config-company')
  })
})
