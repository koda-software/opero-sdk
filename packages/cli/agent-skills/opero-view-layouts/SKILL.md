---
name: opero-view-layouts
description: Use when creating, editing, validating, publishing, resolving, troubleshooting, or explaining Opero View Layouts, including layout drafts, block catalogs, regions, block schemas, custom fields, runtime data, relation tables, and dynamic object form layouts.
---

# Opero View Layouts

Use this skill for Opero View Layout work: deciding what a screen or form should
show, discovering which blocks and fields are available, building full draft
payloads, validating drafts, publishing versions, resolving runtime layouts, and
creating or updating dynamic object records through a published layout.

View Layouts are runtime contracts, not only visual configuration. A layout
decides which fields, blocks, relation tables, buttons, and sections are
available for a surface and mode, and runtime saves enforce the published layout
plus external custom object profile rules.

## References

Read only the reference needed for the task:

- `references/workflow.md`: layout concepts, form-owned layouts, surfaces,
  modes, targets, and the default inspect-plan-save-publish flow.
- `references/discovery-and-schema.md`: discovery commands, block catalog,
  surface definitions, custom field type schemas, runtime context variables, and
  where to find supported properties.
- `references/blocks.md`: block anatomy, sources, refs, field blocks,
  sections, tabs, relation tables, buttons, custom HTML, built-ins, and layout
  placement.
- `references/drafts-validation-publish.md`: full draft saves, preserving
  existing structure, validation states, publishing, versions, assignments, and
  public form publishing.
- `references/custom-fields.md`: existing fields, staged custom fields,
  staged options, update/unlink/delete semantics, and field-change
  confirmations.
- `references/runtime-and-records.md`: runtime resolve, runtime data, dynamic
  record create/update, relation tables, subordinate objects, and enforcement.
- `references/troubleshooting.md`: common 400, 403, 404, 409, validation, draft,
  publish, and runtime failures.

## Before You Start

Before changing a layout:

- Understand which screen or form should change.
- Know whether the change is for create, view, or edit mode.
- Read the current layout first, if it already exists.
- Check which fields and blocks are available before building the change.
- Understand the requested structure: fields, sections, columns, tabs, sidebar,
  relation tables, buttons, or custom fields.
- Know whether the user wants only a draft or wants it published after
  validation.

Before saving, summarize:

```text
I will change this layout:
- Screen/form: ...
- Mode: ...
- Structure: ...
- Fields/blocks changed: ...
- Custom fields: ...
- Publish after validation: yes/no
```

Do not save, publish, archive, restore, or replace assignments until the user
approves.

## Default Procedure

1. Run `opero --json doctor` unless current context already proves auth and API
   reachability.
2. Identify the layout context: `surface`, `mode`, and target fields such as
   `moduleKey`, `objectKey`, `formId`, `recordId`, `scopeId`, or
   `dashboardKey`.
3. Determine whether the layout is form-owned. For custom object forms, use the
   `viewLayoutId` returned by the form. Do not create a second
   `DYNAMIC_OBJECT` layout with `target.formId`.
4. Inspect current state before edits:

   ```bash
   opero --json view-layouts list --surface DYNAMIC_OBJECT --mode EDIT --module-key <moduleKey> --object-key <objectKey> --form-id <formId>
   opero --json view-layouts get <layoutId>
   opero --json view-layouts versions list <layoutId>
   ```

5. Discover allowed schema before constructing blocks:

   ```bash
   opero --json view-layouts surface-definitions --surface DYNAMIC_OBJECT
   opero --json view-layouts catalog --surface DYNAMIC_OBJECT --mode EDIT --module-key <moduleKey> --object-key <objectKey> --form-id <formId>
   opero --json view-layouts custom-field-types
   ```

6. Build an explicit layout plan from the user's desired view: regions, block
   groups, sections, columns, tabs, fields, relation tables, staged custom
   fields, ordering, and modes.
7. Save a full draft payload with all regions and all blocks that should remain:

   ```bash
   opero view-layouts draft save <layoutId> --body-file draft.json
   ```

8. Inspect `validation.state`, `validation.errors`, and `validation.warnings`.
   Fix invalid drafts and save again.
9. Publish only when validation is valid, or warnings are understood and
   acceptable:

   ```bash
   opero view-layouts publish <layoutId> --body-file publish.json
   ```

10. Verify runtime behavior with resolve and, when required, runtime data:

    ```bash
    opero --json view-layouts resolve --surface DYNAMIC_OBJECT --mode EDIT --module-key <moduleKey> --object-key <objectKey> --form-id <formId> --record-id <recordId>
    opero --json view-layouts runtime-data --surface DYNAMIC_OBJECT --mode EDIT --module-key <moduleKey> --object-key <objectKey> --form-id <formId> --record-id <recordId> --body-file runtime-data.json
    ```

## Rules

- Do not guess block shape, refs, required fields, child rules, or custom field
  config. Use discovery endpoints and the existing layout as source of truth.
- Treat catalog `defaultBlock` values as templates. Copy them, add stable IDs,
  set `regionKey` and `displayOrder`, then adjust allowed `grid`, `config`, and
  `children`.
- Respect the layout hierarchy: only tabs and sections can be root blocks;
  sections can be root blocks or tab children; columns can only be section
  children; fields can only be section or column children.
- For section blocks, use `config.wrapInCard: true` by default unless the user
  explicitly asks for no card, or the form clearly should not be card-wrapped.
- Draft save is replace-list style for layout content. Preserve regions,
  blocks, staged fields, script bindings, and metadata that should remain.
- Preserve stable block IDs when the logical block remains the same.
- Removing a field block only hides/removes it from that layout. It does not
  delete the field definition.
- Use staged custom field `delete` only when the user explicitly wants to delete
  the field definition, not just hide it from the layout.
- Do not publish invalid drafts. For `valid_with_warnings`, explain the warning
  before publishing when the user has not already accepted it.
- Runtime creates and updates must satisfy both the published layout and the
  external custom object profile. A visible field may still be non-writable.
