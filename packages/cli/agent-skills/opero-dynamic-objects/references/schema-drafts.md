# Schema Drafts

Use object-scoped schema drafts for object metadata, field, relationship, and
destructive schema changes.

Before drafting any field create/update, fetch the field-type contract:

```bash
opero --json custom-objects field-types get <type>
```

Build field payloads from that response's `createSchema`, `updateSchema`,
`optionsSchema`, `defaults`, `examples`, and `notes`.

## Commands

```bash
opero --json custom-objects schema-drafts list <moduleKey> <objectKey>
opero --json custom-objects schema-drafts get <moduleKey> <objectKey> <draftId>
opero custom-objects schema-drafts create <moduleKey> <objectKey> --body-file draft.json
opero custom-objects schema-drafts update <moduleKey> <objectKey> <draftId> --body-file draft.json
opero custom-objects schema-drafts validate <moduleKey> <objectKey> <draftId>
opero custom-objects schema-drafts apply <moduleKey> <objectKey> <draftId> --body-file apply.json
opero custom-objects schema-drafts delete <moduleKey> <objectKey> <draftId>
```

## Create Draft

The create body requires:

- `clientMutationId`: unique id for replay-safe create.
- `baseSchemaHash`: from `custom-objects schema`.
- `operation`: `CREATE` or `UPDATE`.
- `draft`: object-scoped schema document.

Use `operation: CREATE` for a new object key. Use `operation: UPDATE` for
existing object metadata, fields, relationships, or deletes.

## Draft Document

`draft` may include:

- `object`: object metadata and, for creation, fields.
- `fields`: fields to create or update.
- `deletes.fieldIds`: existing field ids to delete.
- `confirmations.dropColumns`: field ids whose columns may be dropped.
- `confirmations.clearFieldValues`: field ids whose stored values may be
  cleared by type or storage changes.

## Validate Before Apply

Validate every draft:

```bash
opero custom-objects schema-drafts validate <moduleKey> <objectKey> <draftId>
```

Review `status`, `plan.validation.errors`, `plan.validation.warnings`, and
`error`. Do not apply if validation reports unresolved errors. Explain warnings
in plain language before asking for approval.

`plan.validation.warnings.ddl` is expected for additive changes that require
database DDL, such as creating a new object table or adding columns, when there
are no validation errors. Treat it as an operational warning: explain that DDL
is involved, then apply only after approval.

The warning text may appear as:

```text
Schema apply performs physical DDL. Failed non-transactional steps may require repair.
```

This warning alone does not mean the draft is invalid. Validation errors still
block apply; DDL warnings require user awareness and approval.

Warnings such as `fields.<fieldId>.typeChange` mean existing values may be
cleared by a type or storage change. Do not apply until the user accepts that
data impact and required confirmations are present.

## `createDefaultForm`

For new regular objects, set `draft.object.createDefaultForm` to `true` unless
the user explicitly does not want default forms/layouts. Applying that
create-object draft also creates default custom object forms and a form-owned
View Layout container.

Do not use `createDefaultForm` for subordinate objects. The backend rejects
default form creation for subordinate dynamic objects.

Expected post-create state:

- default form ids are set for the object's `CREATE`, `VIEW`, and `EDIT` flows;
- created form layouts may be `DRAFT_ONLY`;
- each form response exposes a `viewLayoutId`;
- the form-owned layout must be edited and published before runtime use if it is
  still draft-only.

After apply, inspect forms and capture `viewLayoutId`:

```bash
opero --json request get /v1/custom-modules/<moduleKey>/objects/<objectKey>/forms
opero --json request get /v1/custom-modules/<moduleKey>/objects/<objectKey>/forms/defaults
```

Use the returned `viewLayoutId` with `opero-view-layouts`; do not create a
separate `DYNAMIC_OBJECT` layout for the same `formId`.

## Updating Fields And Layouts

Adding a field to schema does not automatically add it to existing View Layouts.
When an object edit adds or changes fields:

1. Inspect object forms and defaults.
2. Inspect the form-owned layouts through their `viewLayoutId` values.
3. Ask whether the new or changed fields should appear on create, view, edit,
   or all layouts.
4. If approved, use `opero-view-layouts` to update and publish those layouts.

## Apply

```json
{
  "clientMutationId": "crm-deal-schema-apply-001"
}
```

```bash
opero custom-objects schema-drafts apply <moduleKey> <objectKey> <draftId> --body-file apply.json
```

After apply, re-read schema context and verify that the object, fields, and
references match the requested change.
