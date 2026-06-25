# Safety

Dictionary keys and entry keys are stable references. Changing them can affect
records, forms, queries, scripts, imports, exports, and integrations.

## Risky Changes

Treat these as risky:

- deleting a dictionary;
- changing `entryKeyMode`;
- replacing all entries;
- removing entries that may be referenced by existing data;
- changing entry keys;
- tightening `entryMetadataSchema` with required fields.

## Safer Alternatives

- Deactivate entries with `isActive: false` instead of removing them.
- Export entries before bulk replacement.
- Use `MERGE` instead of `REPLACE` for imports unless the file is the full
  source of truth.
- Omit `entries` from dictionary update when only metadata should change.
- Keep existing entry ids in aggregate replacement payloads.

## Approval Summary

Before destructive changes, summarize:

```text
This will affect dictionary options:
- Dictionary: ...
- Entries kept: ...
- Entries deactivated: ...
- Entries removed: ...
- Replacement/import strategy: MERGE or REPLACE
- Backup/export: yes/no
```

Proceed only after the user approves.
