import {Flags} from '@oclif/core'

import {OperoCliError} from '../../api/errors.js'
import {WriteCommand} from '../../write-command.js'

export default class EntityAttachmentsCreate extends WriteCommand {
  static description = 'Attach a file to an entity.'
  static enableJsonFlag = true
  static flags = {
    description: Flags.string({
      description: 'Attachment description.',
    }),
    'display-name': Flags.string({
      description: 'Attachment display name.',
    }),
    'entity-id': Flags.string({
      description: 'Target entity ID.',
      required: true,
    }),
    'entity-type': Flags.string({
      description: 'Target entity type, for example contractor or custom_record.crm.deal.',
      required: true,
    }),
    'file-id': Flags.string({
      description: 'Uploaded file ID.',
      required: true,
    }),
    kind: Flags.string({
      description: 'Attachment kind.',
    }),
    'metadata-json': Flags.string({
      description: 'JSON metadata object.',
    }),
    position: Flags.integer({
      description: 'Attachment position.',
      min: 0,
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(EntityAttachmentsCreate)
    return this.postJson('/v1/entity-attachments', flags, {
      description: flags.description,
      displayName: flags['display-name'],
      entityId: flags['entity-id'],
      entityType: flags['entity-type'],
      fileId: flags['file-id'],
      kind: flags.kind,
      metadata: parseMetadata(flags['metadata-json']),
      position: flags.position,
    })
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
