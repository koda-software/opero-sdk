# Records

Records are saved data for one object. Use record commands when the user wants
to create, edit, inspect, or delete actual data rather than the schema.

## Commands

```bash
opero --json custom-records list <moduleKey> <objectKey> --limit 20
opero --json custom-records get <moduleKey> <objectKey> <recordId>
opero --json custom-records get <moduleKey> <objectKey> <recordId> --expand field1,field2
opero custom-records create <moduleKey> <objectKey> --body-file record.json
opero custom-records update <moduleKey> <objectKey> <recordId> --body-file record.json
opero custom-records delete <moduleKey> <objectKey> <recordId>
```

For singleton objects:

```bash
opero --json custom-records singleton <moduleKey> <objectKey>
opero custom-records update-singleton <moduleKey> <objectKey> --body-file record.json
```

## Record Safety

- For organization tokens, use `opero companies select <companyId>`, pass
  `--company-id <companyId>`, or set `OPERO_COMPANY_ID` when reading or
  mutating company-scoped records.
- Record responses include `company_id` when returned by the API; treat it as
  the owning company identifier, not as an editable field value.
- Inspect object fields before writing records.
- Use field keys from schema; do not invent field keys.
- Check writable fields from `custom-objects get`.
- Use `--expand` only for expandable reference fields.
- Treat record delete as a live destructive action.

If record creation or update must follow a published form layout, use View
Layout runtime or custom object form runtime workflows instead of direct record
commands.
