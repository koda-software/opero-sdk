import {Flags} from '@oclif/core'

export const workflowTargetTypeOptions = ['SALES_INVOICE', 'COST_INVOICE', 'CONTRACTOR', 'DYNAMIC_OBJECT_RECORD']

export const workflowTargetQueryFlags = {
  'module-key': Flags.string({
    description: 'Dynamic module key. Required for DYNAMIC_OBJECT_RECORD targets.',
  }),
  'object-key': Flags.string({
    description: 'Dynamic object key. Required for DYNAMIC_OBJECT_RECORD targets.',
  }),
}

export function buildWorkflowTargetQuery(flags: {'module-key'?: string; 'object-key'?: string}) {
  return {
    moduleKey: flags['module-key'],
    objectKey: flags['object-key'],
  }
}
