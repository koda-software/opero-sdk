import {Flags} from '@oclif/core'

import type {Query} from '../api/query.js'

const modes = ['VIEW', 'EDIT', 'CREATE', 'WORKSPACE']
const surfaces = ['DYNAMIC_OBJECT', 'CONTRACTOR', 'ORGANIZATION', 'SALES_INVOICE', 'COST_INVOICE', 'DASHBOARD', 'USER']

export const viewLayoutListFlags = {
  'dashboard-key': Flags.string({
    description: 'Dashboard key target filter.',
  }),
  'form-id': Flags.string({
    description: 'Dynamic form ID target filter.',
  }),
  mode: Flags.string({
    description: 'View layout mode filter.',
    options: modes,
  }),
  'module-key': Flags.string({
    description: 'Dynamic object module key target filter.',
  }),
  'object-key': Flags.string({
    description: 'Dynamic object key target filter.',
  }),
  'scope-id': Flags.string({
    description: 'Scoped target ID filter.',
  }),
  surface: Flags.string({
    description: 'View layout surface filter.',
    options: surfaces,
  }),
}

export const viewLayoutContextFlags = {
  'dashboard-key': Flags.string({
    description: 'Dashboard key.',
  }),
  'entity-id': Flags.string({
    description: 'Built-in entity ID.',
  }),
  expand: Flags.string({
    description: 'Comma-separated dynamic form field keys to expand.',
  }),
  'form-id': Flags.string({
    description: 'Dynamic form ID.',
  }),
  'layout-id': Flags.string({
    description: 'Explicit published View Layout ID.',
  }),
  mode: Flags.string({
    description: 'View layout runtime mode.',
    options: modes,
    required: true,
  }),
  'module-key': Flags.string({
    description: 'Dynamic object module key.',
  }),
  'object-key': Flags.string({
    description: 'Dynamic object key.',
  }),
  'record-id': Flags.string({
    description: 'Dynamic object record ID.',
  }),
  'scope-id': Flags.string({
    description: 'Scoped target ID.',
  }),
  surface: Flags.string({
    description: 'View layout surface.',
    options: surfaces,
    required: true,
  }),
}

export const viewLayoutCatalogFlags = {
  ...viewLayoutContextFlags,
  'draft-version-id': Flags.string({
    description: 'Draft version ID for catalog context.',
  }),
}

export const relationTargetFlags = {
  ...viewLayoutContextFlags,
  'target-form-id': Flags.string({
    description: 'Selected target row dynamic form ID.',
  }),
  'target-mode': Flags.string({
    description: 'Target row layout mode.',
    options: modes,
    required: true,
  }),
}

export const relationQueryFlags = {
  ...viewLayoutContextFlags,
  'target-form-id': Flags.string({
    description: 'Selected target row dynamic form ID.',
  }),
  'target-mode': Flags.string({
    description: 'Target row layout mode.',
    options: modes,
  }),
}

export type ViewLayoutQueryFlags = {
  'dashboard-key'?: string
  'draft-version-id'?: string
  'entity-id'?: string
  expand?: string
  'form-id'?: string
  'layout-id'?: string
  mode?: string
  'module-key'?: string
  'object-key'?: string
  'record-id'?: string
  'scope-id'?: string
  surface?: string
  'target-form-id'?: string
  'target-mode'?: string
}

export function buildViewLayoutQuery(flags: ViewLayoutQueryFlags): Query {
  return {
    dashboardKey: flags['dashboard-key'],
    draftVersionId: flags['draft-version-id'],
    entityId: flags['entity-id'],
    expand: flags.expand,
    formId: flags['form-id'],
    layoutId: flags['layout-id'],
    mode: flags.mode,
    moduleKey: flags['module-key'],
    objectKey: flags['object-key'],
    recordId: flags['record-id'],
    scopeId: flags['scope-id'],
    surface: flags.surface,
    targetFormId: flags['target-form-id'],
    targetMode: flags['target-mode'],
  }
}
