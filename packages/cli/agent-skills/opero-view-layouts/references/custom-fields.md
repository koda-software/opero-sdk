# Custom Fields

View Layouts can show existing fields and can stage field definition changes in
a draft.

## Field Sources

- Dynamic object fields use `source: "dynamic_field"` and `ref.fieldKey`.
- Built-in surface custom fields use `source: "custom_field"` and
  `ref.fieldDefinitionId`.
- New or changed custom fields staged in the draft use
  `source: "draft_custom_field"` and `ref.draftFieldDefinitionId`.

## Discover Type Schemas

Before creating or editing field definitions:

```bash
opero --json view-layouts custom-field-types
```

Use the returned type schemas to build `config`, validation settings, and
field-specific options. Do not copy config from an unrelated field type.

For dictionary-backed custom fields, use the custom field type schema returned
by this command. The field type catalog exposes option sources such as
`dictionary`; dictionary-backed custom fields use dictionary configuration such
as `dictionaryId`.

Dynamic object schema `SELECT`/`MULTI_SELECT` fields can also use
`options.dictionaryId`, but those are changed through custom object schema
drafts and then placed in layouts as `source: "dynamic_field"` blocks. Before
changing a dynamic object field, fetch its contract with:

```bash
opero --json custom-objects field-types get <type>
```

Do not add option filter scripts to dynamic field `options`. Use View Layout
`scriptBindings` with `hook: "optionFilter"` and a target such as
`blockId`/`fieldKey`.

## Add Existing Dynamic Object Fields

Use the catalog for the exact form and mode. Then add a `field` block:

```json
{
  "id": "field_priority",
  "type": "field",
  "source": "dynamic_field",
  "ref": { "fieldKey": "priority" },
  "regionKey": "main",
  "displayOrder": 2,
  "grid": { "colSpan": 6 },
  "config": { "label": "Priority" },
  "requiredPolicy": "optional",
  "supportedModes": ["CREATE", "EDIT", "VIEW"],
  "children": []
}
```

The field must exist on the custom object and be available for the selected
mode.

## Stage A New Custom Field

Add an entry to `stagedFieldDefinitions` and reference it from a block:

```json
{
  "stagedFieldDefinitions": [
    {
      "draftId": "draft_priority",
      "action": "create",
      "existingFieldDefinitionId": null,
      "scopeId": null,
      "name": "Priority",
      "key": "priority",
      "type": "TEXT",
      "config": { "required": false },
      "presentation": null
    }
  ],
  "blocks": [
    {
      "id": "field_priority",
      "type": "field",
      "source": "draft_custom_field",
      "ref": { "draftFieldDefinitionId": "draft_priority" },
      "regionKey": "main",
      "displayOrder": 2,
      "grid": { "colSpan": 6 },
      "config": { "label": "Priority" },
      "requiredPolicy": "optional",
      "children": []
    }
  ]
}
```

The staged field definition is committed when the draft is published.

Use `presentation` for typed custom-field display defaults when the current API
schema exposes them. Examples include file image presentation, textarea rows,
and multi-select display mode. Do not use the older `frontendMeta` key.

## Update, Unlink, Or Delete

Use `action: "update"` with `existingFieldDefinitionId` to edit a field
definition.

Removing a block and changing the field definition are different operations:

- Remove a block: the field no longer appears in that layout position; the
  definition remains.
- `unlink`: remove the field from the current layout contract without deleting
  the definition.
- `delete`: delete the field definition. Use only when explicitly requested.

Never interpret "hide this field from the form" as "delete the field
definition" without confirmation.

## Staged Field Options

Some staged definitions expose server-provided options:

```bash
opero --json view-layouts draft staged-field-definitions options <layoutId> <draftFieldDefinitionId>
```

Use this when the field editor needs allowed options for the staged definition.

## Validation And Confirmation

Draft save and publish can report:

- unsupported field type config;
- required field blocks missing;
- deleted or unavailable field refs;
- staged changes that require confirmation;
- field type changes that may clear values.

When publish requires `confirmFieldChanges`, explain the effect and include
confirmations only after the user accepts the data impact.
