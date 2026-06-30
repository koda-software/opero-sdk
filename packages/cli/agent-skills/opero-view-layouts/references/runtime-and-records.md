# Runtime And Records

Runtime endpoints use published View Layouts. Draft changes do not affect
runtime until they are published.

For organization tokens, use `opero companies select <companyId>`, pass
`--company-id <companyId>`, or set `OPERO_COMPANY_ID` when resolving, reading
runtime data, mutating records, or loading relation-table runtime data for
company-scoped records.

## Resolve A Layout

Resolve returns the selected published layout and the block tree to render:

```bash
opero --json view-layouts resolve --surface DYNAMIC_OBJECT --mode CREATE --module-key <moduleKey> --object-key <objectKey> --form-id <formId>
```

For view or edit of an existing record, include `--record-id`:

```bash
opero --json view-layouts resolve --surface DYNAMIC_OBJECT --mode EDIT --module-key <moduleKey> --object-key <objectKey> --form-id <formId> --record-id <recordId>
```

The response includes selected layout/version, regions, blocks, validation,
data requirements, render context, runtime context, unavailable blocks, and
render data.

## Runtime Data

Resolve can return `dataRequirements` for lazy block data. Send those
requirements to runtime data:

```bash
opero --json view-layouts runtime-data --surface DYNAMIC_OBJECT --mode VIEW --module-key <moduleKey> --object-key <objectKey> --form-id <formId> --record-id <recordId> --body-file runtime-data.json
```

The request body should contain the requirements returned by resolve:

```json
{
  "requirements": [
    {
      "blockId": "field_title",
      "type": "dynamic_fields",
      "key": "ticket_fields"
    }
  ]
}
```

The API checks that requirements belong to the resolved layout. Do not invent
requirements.

## Create Dynamic Records

Create uses the resolved `CREATE` layout:

```bash
opero view-layouts runtime dynamic-object records create --surface DYNAMIC_OBJECT --mode CREATE --module-key <moduleKey> --object-key <objectKey> --form-id <formId> --body-file record.json
```

Typical body:

```json
{
  "clientMutationId": "ticket-create-001",
  "values": {
    "title": "Cannot log in",
    "notes": "The customer cannot access the portal."
  }
}
```

`clientMutationId` is required for create requests. If an active workflow
applies, the runtime contract may require workflow context.

## Update Dynamic Records

Update uses the resolved `EDIT` layout:

```bash
opero view-layouts runtime dynamic-object records update <recordId> --surface DYNAMIC_OBJECT --mode EDIT --module-key <moduleKey> --object-key <objectKey> --form-id <formId> --body-file record.json
```

Only fields writable through both the published layout and the external custom
object profile can be updated. A workflow stage can also block editing.

## Relation Table Saves

Relation table changes are saved in the parent create/update payload:

```json
{
  "clientMutationId": "ticket-create-with-comments",
  "values": {
    "title": "Cannot log in"
  },
  "relationTables": {
    "comments": {
      "create": [
        {
          "clientId": "tmp_comment_1",
          "values": {
            "text": "Initial report from support desk."
          }
        }
      ]
    }
  }
}
```

Nested relation targets must also be exposed through an external custom object
profile and allow the nested operation.

## Relation Table Metadata

Use these when a UI needs row layouts or relation rows:

```bash
opero --json view-layouts runtime dynamic-object relation-tables target-layout <relationFieldKey> --surface DYNAMIC_OBJECT --mode EDIT --module-key <moduleKey> --object-key <objectKey> --form-id <formId> --target-mode CREATE
opero --json view-layouts runtime dynamic-object relation-tables table-layout --surface DYNAMIC_OBJECT --mode VIEW --module-key <moduleKey> --object-key <objectKey> --form-id <formId> --body-file table-layout.json
opero --json view-layouts runtime dynamic-object relation-tables query <recordId> <relationFieldKey> --surface DYNAMIC_OBJECT --mode VIEW --module-key <moduleKey> --object-key <objectKey> --form-id <formId> --body-file relation-query.json
```

The query endpoint includes the parent `recordId` because relation rows are read
in the context of that parent.

## Subordinate Objects

Subordinate object changes use `subordinateObjects`, keyed by subordinate
reference field key:

```json
{
  "clientMutationId": "ticket-update-subtasks",
  "subordinateObjects": {
    "subtasks": {
      "create": [
        {
          "clientId": "tmp_subtask_1",
          "values": {
            "title": "Check account status"
          }
        }
      ]
    }
  }
}
```

Subordinate objects are saved through the parent aggregate request, not direct
standalone runtime endpoints.

## Runtime Enforcement

Runtime endpoints check:

- API token permissions;
- organization scope;
- target company header for organization tokens where required;
- custom object exposure through an external profile;
- readable/writable/filterable/sortable profile rules;
- published layout mode and block availability;
- nested relation and subordinate target profile rules;
- workflow edit restrictions.

If runtime rejects a request, inspect both the resolved layout and the external
custom object profile rules.
