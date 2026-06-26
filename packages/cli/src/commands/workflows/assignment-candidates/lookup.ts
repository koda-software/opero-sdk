import {Flags} from '@oclif/core'

import {ReadCommand} from '../../../read-command.js'

export default class WorkflowsAssignmentCandidatesLookup extends ReadCommand {
  static description = 'Look up valid workflow assignment candidates.'
  static enableJsonFlag = true
  static flags = {
    'candidate-type': Flags.string({
      description: 'Candidate kind to look up.',
      options: ['membership', 'role'],
      required: true,
    }),
    limit: Flags.integer({
      description: 'Dropdown result limit. Values above 10 are capped by the API.',
      min: 1,
    }),
    search: Flags.string({
      description: 'Case-insensitive text search for dropdown autocomplete.',
    }),
    'source-id': Flags.string({
      description: 'Workflow stage or transition ID.',
      required: true,
    }),
    'source-type': Flags.string({
      description: 'Assignment source type.',
      options: ['stage', 'transition'],
      required: true,
    }),
  }

  async run(): Promise<unknown> {
    const {flags} = await this.parse(WorkflowsAssignmentCandidatesLookup)
    return this.getJson('/v1/workflows/assignment-candidates/lookup', flags, {
      candidateType: flags['candidate-type'],
      limit: flags.limit,
      search: flags.search,
      sourceId: flags['source-id'],
      sourceType: flags['source-type'],
    })
  }
}
