import {Flags} from '@oclif/core'

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
  protected async deleteJson(path: string, flags: WriteFlags, query?: Query): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = query === undefined ? await client.delete(path) : await client.delete(path, {query})

    if (!this.jsonEnabled()) this.printOutput(result, flags)
    return result
  }

  protected async patchJson(path: string, flags: BodyFileFlags & WriteFlags, body?: unknown): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.patch(path, {body: body ?? (await readRequiredJsonBodyFile(flags['body-file']))})

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

  protected async postJson(path: string, flags: BodyFileFlags & WriteFlags, body?: unknown): Promise<unknown> {
    const {settings} = await this.loadSettings(flags)
    const client = this.createApiClient(settings)
    const result = await client.post(path, {body: body ?? (await readRequiredJsonBodyFile(flags['body-file']))})

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
}

async function readRequiredJsonBodyFile(path: string | undefined): Promise<unknown> {
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
