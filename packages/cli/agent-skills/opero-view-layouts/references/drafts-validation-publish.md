# Drafts, Validation, And Publish

## Full Draft Save

Saving a draft replaces the editable draft content. Include everything that
should remain:

- `schemaVersion`;
- `regions`;
- `blocks`;
- `stagedFieldDefinitions`;
- `scriptBindings`;
- `metadata`;
- `clientMutationId`.

Blocks and staged custom field definitions may expose typed `presentation`
objects. Preserve existing `presentation` values unless the user asks to change
field display behavior.

Use `scriptBindings` for layout script hooks such as `optionFilter`,
`fieldVisibility`, `fieldReadonly`, and `fieldDefault`. Do not store option
filter script ids in dynamic object field `options`; `options.optionFilterScriptId`
is not supported.

Command:

```bash
opero view-layouts draft save <layoutId> --body-file draft.json
```

Minimal dynamic object draft shape:

```json
{
  "clientMutationId": "ticket-layout-draft-001",
  "schemaVersion": 1,
  "regions": [
    {
      "key": "main",
      "label": "Main",
      "layout": "grid",
      "columns": 12,
      "displayOrder": 0,
      "config": {}
    }
  ],
  "blocks": [],
  "stagedFieldDefinitions": [],
  "scriptBindings": [],
  "metadata": null
}
```

Option filter binding shape:

```json
{
  "id": "binding_filter_city_options",
  "scriptId": "script_id",
  "hook": "optionFilter",
  "target": {
    "blockId": "field_city",
    "fieldKey": "city"
  },
  "enabled": true,
  "priority": 0,
  "config": {}
}
```

When modifying an existing layout, start from the current draft or published
version and edit it. Do not send a tiny partial draft unless the intent is to
remove everything else.

## Regions

A simple form can start with one `main` region. More complex layouts may use
`sidebar`, `tabs`, or surface-specific regions from surface definitions.

Common region fields:

- `key`: stable region identifier referenced by blocks.
- `label`: human label.
- `layout`: `grid`, `tabs`, `stack`, `sidebar`, or `dashboard_grid`.
- `columns`: number of grid columns when applicable.
- `displayOrder`: region order.
- `config`: region-specific settings.

Blocks must reference an existing region with `regionKey`.

## Validation

Draft save responses include validation. Inspect:

- `validation.state`;
- `validation.errors`;
- `validation.warnings`.

States:

- `valid`: can be published.
- `valid_with_warnings`: can be published, but warnings should be reviewed.
- `invalid`: cannot be published.

Common validation issues:

- required field or built-in blocks missing;
- block `ref` points to a deleted or unavailable field;
- block placed in a missing region;
- nested block violates catalog child rules;
- unsupported field type config;
- staged field change requires confirmation;
- required mode-specific block is missing.

## Publish

Publishing makes the saved draft live at runtime:

```bash
opero view-layouts publish <layoutId> --body-file publish.json
```

Typical publish payload:

```json
{
  "clientMutationId": "ticket-layout-publish-001",
  "draftVersionId": "version_ticket_draft_1"
}
```

If publish returns a validation conflict, save the draft again and inspect
validation details. Do not retry publish blindly.

## Field Change Confirmations

Publishing staged custom field changes can require confirmation when the change
may clear values or change a field type:

```json
{
  "clientMutationId": "publish-priority-change",
  "draftVersionId": "version_ticket_draft_2",
  "confirmFieldChanges": [
    {
      "draftId": "draft_update_priority",
      "confirmTypeChange": true,
      "confirmValueClear": true
    }
  ]
}
```

Only include confirmations after the user has accepted the effect.

## Public Forms

Public create forms can use a pinned published View Layout version. When the new
published version should replace the public version, publish with the public
pinning option if supported by the current API payload:

```json
{
  "clientMutationId": "ticket-layout-public-publish-001",
  "draftVersionId": "version_ticket_draft_1",
  "advancePublicPinnedVersion": true
}
```

Use this only when the user wants the public form to change.

## Versions And Restore

Commands:

```bash
opero --json view-layouts versions list <layoutId>
opero --json view-layouts versions get <layoutId> <versionId>
opero view-layouts versions restore-draft <layoutId> <versionId> --body-file restore.json
```

Restoring creates or replaces the draft. It does not publish automatically.
Publish restored drafts only after reviewing validation and confirming the
version should go live.

## Assignments

Assignments are for organization-owned layouts that need role or default
selection:

```bash
opero view-layouts assignments replace <layoutId> --body-file assignments.json
```

Form-owned dynamic object layouts are normally selected through the form, not
through layout assignments.
