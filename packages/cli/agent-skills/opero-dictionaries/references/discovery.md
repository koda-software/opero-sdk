# Discovery

Inspect dictionaries before changing them.

## List Dictionaries

```bash
opero --json dictionaries list
opero --json dictionaries list --limit 50
opero --json dictionaries list --filters '{"op":"AND","items":[{"field":"key","operator":"contains","value":"payment"}]}'
```

Use list output to find dictionary ids and keys.

## Get Dictionary With Entries

```bash
opero --json dictionaries get <id>
```

Use this before updates because `dictionaries update` can replace the complete
entry set when `entries` is present.

Check:

- `entryKeyMode`;
- `entryMetadataSchema`;
- existing entry ids and keys;
- active vs inactive entries;
- translations and metadata;
- entry order.

## List Or Get Entries

```bash
opero --json dictionaries entries <dictionaryId>
opero --json dictionaries entries <dictionaryId> --limit 100
opero --json dictionaries entries get <dictionaryId> <entryId>
```

Use entry ids when preparing aggregate updates for existing entries. Use entry
keys when discussing stable option values with users.
