# Import And Export

Use import/export when entries are managed from files or synchronized with an
external system.

## Export

```bash
opero dictionaries entries export <dictionaryId> --format json --out entries.json
opero dictionaries entries export <dictionaryId> --format csv --out entries.csv
opero dictionaries entries export <dictionaryId> --format csv --out exports/entries.csv --create-dirs
opero dictionaries entries export <dictionaryId> --format json --out entries.json --force
```

Export before large changes when you need a backup or a spreadsheet-friendly
starting point.

## Import

```bash
opero dictionaries entries import <dictionaryId> --file entries.json --strategy MERGE
opero dictionaries entries import <dictionaryId> --file entries.csv --strategy REPLACE
```

`MERGE` upserts entries by resolved key. Existing entries not present in the
file remain unchanged.

`REPLACE` deletes current entries first, then creates the uploaded entries in
file order.

Use `MERGE` for recurring synchronization jobs. Use `REPLACE` only when the
user confirms the file is the complete desired dictionary contents.

## File Guidance

- Use JSON when preserving metadata and translations precisely.
- Use CSV when a user wants spreadsheet editing.
- Confirm the entry key mode before import.
- Validate with `dictionaries get` or `dictionaries entries` after import.
