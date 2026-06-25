---
name: opero-dictionaries
description: Use when creating, listing, reading, updating, deleting, importing, exporting, or explaining Opero dictionaries and dictionary entries, including entry key modes, metadata schemas, translations, active/inactive entries, MERGE and REPLACE imports, aggregate entry replacement, and safe dictionary CRUD workflows.
---

# Opero Dictionaries

Use this skill for Opero dictionaries: reusable option lists with stable entry
keys and display labels, such as payment methods, statuses, categories, units,
or other selectable values.

Dictionaries have direct CRUD commands. Dictionary entries can be listed, read,
exported, and imported. Entry create/update/delete is done through dictionary
aggregate update or entry import, not standalone entry write commands.

## References

Read only the reference needed for the task:

- `references/concepts.md`: dictionary model, entries, key modes, translations,
  metadata schema, active/inactive entries, and where dictionaries are used.
- `references/discovery.md`: list, inspect, filter, and read dictionaries and
  entries before changing them.
- `references/crud.md`: dictionary CRUD and aggregate entry replacement.
- `references/import-export.md`: export/import files, JSON/CSV, `MERGE` vs
  `REPLACE`, and sync guidance.
- `references/safety.md`: deletion, replacement, key changes, and safer
  alternatives.
- `references/payloads.md`: compact JSON examples for create, update, replace
  entries, deactivate entries, import, and export.

## Before You Start

Before changing a dictionary:

- Know which dictionary should change.
- Know whether the user wants dictionary settings, entries, metadata, import,
  export, or deletion.
- Inspect the current dictionary and entries.
- Understand whether missing entries should remain, be deactivated, or be
  removed.
- For import or replacement, know whether the file is an update or the full
  source of truth.

Before creating, updating, importing with `REPLACE`, or deleting, summarize:

```text
I will change this dictionary:
- Dictionary: ...
- Change: ...
- Entry behavior: keep existing / merge / replace / deactivate / delete
- Risk: ...
```

Do not perform write commands until the user approves.

## Default Procedure

1. Run `opero --json doctor` unless recent context proves auth and API
   reachability.
2. Inspect current state:

   ```bash
   opero --json dictionaries list
   opero --json dictionaries get <id>
   opero --json dictionaries entries <dictionaryId>
   ```

3. For dictionary metadata or aggregate entry changes, prepare a body file and
   use `dictionaries create` or `dictionaries update`.
4. For file sync, export first when useful, then import with `MERGE` unless the
   user explicitly wants full replacement.
5. Verify with `dictionaries get` or `dictionaries entries`.

## Rules

- Preserve existing entries unless the user clearly approved replacement.
- Prefer deactivating an entry with `isActive: false` over removing it when
  existing records may still reference the key.
- Use `MERGE` for recurring imports and sync jobs by default.
- Use `REPLACE` only when the user confirms the file should become the full
  entry set.
- Do not change entry keys casually. Keys are stable references used by records,
  API payloads, forms, queries, scripts, and integrations.
- Treat dictionary delete as destructive.
