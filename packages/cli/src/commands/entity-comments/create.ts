import {Flags} from '@oclif/core'

import {OperoCliError} from '../../api/errors.js'
import {readJsonBodyFile} from '../../api/payload.js'
import {WriteCommand} from '../../write-command.js'

export default class EntityCommentsCreate extends WriteCommand {
  static description = 'Create an entity comment.'
  static enableJsonFlag = true
  static flags = {
    body: Flags.string({
      description: 'Comment body.',
      exclusive: ['body-file'],
    }),
    'body-file': Flags.string({
      description: 'JSON request body file. Use - to read from stdin.',
      exclusive: ['body'],
    }),
    'entity-id': Flags.string({
      description: 'Target entity ID.',
      required: true,
    }),
    'entity-type': Flags.string({
      description: 'Target entity type, for example contractor or custom_record.crm.deal.',
      required: true,
    }),
    'metadata-json': Flags.string({
      description: 'JSON metadata object.',
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(EntityCommentsCreate)
    return this.postJson('/v1/entity-comments', flags, await buildCreateBody(flags))
  }
}

async function buildCreateBody(flags: {
  body?: string
  'body-file'?: string
  'entity-id': string
  'entity-type': string
  'metadata-json'?: string
}): Promise<unknown> {
  if (flags['body-file']) return readJsonBodyFile(flags['body-file'])
  if (!flags.body) {
    throw new OperoCliError({
      code: 'USAGE_ERROR',
      exitCode: 2,
      message: 'Provide either --body or --body-file.',
    })
  }

  return {
    body: flags.body,
    entityId: flags['entity-id'],
    entityType: flags['entity-type'],
    metadata: parseMetadata(flags['metadata-json']),
  }
}

function parseMetadata(value: string | undefined): unknown {
  if (!value) return undefined
  try {
    return JSON.parse(value) as unknown
  } catch (error) {
    throw new OperoCliError({
      code: 'INVALID_JSON',
      details: error instanceof Error ? error.message : undefined,
      exitCode: 2,
      message: '--metadata-json must be valid JSON',
    })
  }
}
