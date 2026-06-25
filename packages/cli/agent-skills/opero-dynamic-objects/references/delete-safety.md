# Delete Safety

Object and field deletion can affect records, forms, View Layouts, rules,
queries, scripts, relationships, and integrations.

## Preview Object Delete Impact

Always inspect impact first:

```bash
opero --json custom-objects delete-impact <moduleKey> <objectKey>
```

Review:

- records;
- fields;
- forms;
- View Layouts;
- incoming and outgoing relationships;
- custom field definitions;
- warnings;
- `canDelete`.

## Delete Object

Only delete after explicit approval:

```json
{
  "clientMutationId": "crm-deal-delete-001",
  "confirmObjectKey": "deal",
  "confirmDropTable": true
}
```

```bash
opero custom-objects delete <moduleKey> <objectKey> --body-file delete.json
```

`confirmObjectKey` must match the object key. `confirmDropTable: true` confirms
that the object's storage table may be dropped.

## Field Deletes And Destructive Changes

Schema drafts may require:

- `deletes.fieldIds` for removed fields;
- `confirmations.dropColumns` for dropping storage columns;
- `confirmations.clearFieldValues` for type or storage changes that clear data.

Do not include confirmations until the user has accepted the impact.

## Safer Alternatives

If the user wants something hidden rather than deleted:

- set object `isHidden`;
- set object `isActive: false`;
- hide a field from forms through View Layouts;
- remove the field block from a layout;
- adjust form defaults or access.
