import {Flags} from '@oclif/core'

import type {RequestOptions} from './api/client.js'
import {OperoCliError} from './api/errors.js'
import {readJsonBodyFile} from './api/payload.js'
import {BaseCommand} from './base-command.js'
import type {GlobalConfigFlags} from './config/load.js'
import type {OutputFormatFlags} from './output.js'
import type {Query} from './api/query.js'

export const bodyFileFlag = {
  'body-file': Flags.string({
    description: 'JSON request body file. Use - to read from stdin.',
    required: true,
  }),
}

export type BodyFileFlags = {
  'body-file'?: string
}

type WriteFlags = GlobalConfigFlags & OutputFormatFlags & Record<string, unknown>

export abstract class WriteCommand extends BaseCommand {
  protected async deleteJson(path: string, flags: WriteFlags, query?: Query, options: Omit<RequestOptions, 'query'> = {}): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const requestOptions = query === undefined ? options : {...options, query}
    const result = Object.keys(requestOptions).length === 0 ? await client.delete(path) : await client.delete(path, requestOptions)

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }

  protected async patchJson(path: string, flags: BodyFileFlags & WriteFlags, body?: unknown, query?: Query, options: Omit<RequestOptions, 'body' | 'query'> = {}): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.patch(path, writeOptions(body ?? (await readRequiredJsonBodyFile(flags['body-file'])), query, options))

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }

  protected async patchNoBody(path: string, flags: WriteFlags): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.patch(path)

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }

  protected async postJson(path: string, flags: BodyFileFlags & WriteFlags, body?: unknown, query?: Query, options: Omit<RequestOptions, 'body' | 'query'> = {}): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.post(path, writeOptions(body ?? (await readRequiredJsonBodyFile(flags['body-file'])), query, options))

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }

  protected async postNoBody(path: string, flags: WriteFlags): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.post(path)

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }

  protected async putJson(path: string, flags: BodyFileFlags & WriteFlags, body?: unknown, query?: Query): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.request('PUT', path, writeOptions(body ?? (await readRequiredJsonBodyFile(flags['body-file'])), query, {}))

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }
}

function writeOptions(body: unknown, query: Query | undefined, options: Omit<RequestOptions, 'body' | 'query'>): RequestOptions {
  return query === undefined ? {...options, body} : {...options, body, query}
}

export async function readRequiredJsonBodyFile(path: string | undefined): Promise<unknown> {
  const body = await readJsonBodyFile(path)
  if (body === undefined) {
    throw new OperoCliError({
      code: 'USAGE_ERROR',
      exitCode: 2,
      message: 'Missing required --body-file',
    })
  }

  return body
}
