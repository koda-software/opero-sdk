# CRUD

## Dictionary CRUD

```bash
opero --json dictionaries list
opero --json dictionaries get <id>
opero dictionaries create --body-file dictionary.json
opero dictionaries update <id> --body-file dictionary-update.json
opero dictionaries delete <id>
```

Create requires `key`, `name`, and `entryKeyMode`. It may include
`description`, `entryMetadataSchema`, `entries`, and `clientMutationId`.

Update may change `name`, `description`, `entryKeyMode`,
`entryMetadataSchema`, `entries`, and `clientMutationId`.

Delete removes the dictionary. Do not delete unless the user explicitly
approved the impact.

## Entry Read Operations

```bash
opero --json dictionaries entries <dictionaryId>
opero --json dictionaries entries get <dictionaryId> <entryId>
```

Entries do not have standalone create/update/delete commands. To create,
update, deactivate, reorder, or remove entries, use dictionary aggregate update
or import entries from a file.

## Aggregate Entry Replacement

In `dictionaries update`, omit `entries` to leave entries unchanged. Include
`entries` only when replacing the complete ordered entry set:

```json
{
  "entries": {
    "mode": "replace",
    "items": []
  }
}
```

Submitted items become the full ordered entry set. For existing entries, include
`id` when available. For new entries, omit `id` and use `clientRowId` when you
need to map validation errors back to a row.

To remove an entry from new selections without deleting it, keep the entry and
set `isActive: false`.
