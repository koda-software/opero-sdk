# Curated Commands

Use curated commands before raw requests. They share CLI config, auth, timeout,
JSON behavior, output rendering, and error normalization.

## Health And Auth

```bash
opero --json doctor
opero --json health
opero --json ping
opero --json auth status
opero auth login --api-token "$OPERO_API_TOKEN"
opero auth logout
opero --json config show
```

## List Flags

List endpoints support shared flags where the API supports them:

```bash
--page 1
--limit 20
--count hasMore
--filter-json '{"op":"AND","items":[]}'
--sort-json '[{"field":"createdAt","direction":"desc"}]'
--columns id,name
```

`--filter-json`, `--sort-json`, and JSON-array `--columns` values are validated
before the request. `--columns id,name` is sent as a JSON array string.

## Reference Data

```bash
opero --json currencies list
opero --json dictionaries list
opero --json dictionaries get <id>
opero --json dictionaries entries <dictionaryId>
```

## Contractors

```bash
opero --json contractors list --limit 20
opero --json contractors get <id>
opero contractors create --body-file contractor.json
opero contractors update <id> --body-file contractor.json
opero contractors update-status <id> --body-file status.json
```

## Custom Data

Modules:

```bash
opero --json custom-modules list
opero --json custom-modules get <moduleKey>
opero custom-modules create --body-file module.json
opero custom-modules update <moduleKey> --body-file module.json
opero --json custom-modules delete-impact <moduleKey>
opero custom-modules delete <moduleKey>
opero --json custom-modules schema <moduleKey>
```

Module schema drafts:

```bash
opero --json custom-modules schema-drafts list <moduleKey>
opero --json custom-modules schema-drafts get <moduleKey> <draftId>
opero custom-modules schema-drafts create <moduleKey> --body-file draft.json
opero custom-modules schema-drafts update <moduleKey> <draftId> --body-file draft.json
opero custom-modules schema-drafts validate <moduleKey> <draftId> --body-file validate.json
opero custom-modules schema-drafts apply <moduleKey> <draftId> --body-file apply.json
opero custom-modules schema-drafts delete <moduleKey> <draftId>
```

Objects:

```bash
opero --json custom-objects list <moduleKey>
opero --json custom-objects get <moduleKey> <objectKey>
opero --json custom-objects schema <moduleKey> <objectKey>
opero --json custom-objects schema <moduleKey> <objectKey> --mode edit
opero --json custom-objects delete-impact <moduleKey> <objectKey>
opero custom-objects delete <moduleKey> <objectKey> --body-file delete.json
```

Object schema drafts:

```bash
opero --json custom-objects schema-drafts list <moduleKey> <objectKey>
opero --json custom-objects schema-drafts get <moduleKey> <objectKey> <draftId>
opero custom-objects schema-drafts create <moduleKey> <objectKey> --body-file draft.json
opero custom-objects schema-drafts update <moduleKey> <objectKey> <draftId> --body-file draft.json
opero custom-objects schema-drafts validate <moduleKey> <objectKey> <draftId>
opero custom-objects schema-drafts apply <moduleKey> <objectKey> <draftId> --body-file apply.json
opero custom-objects schema-drafts delete <moduleKey> <objectKey> <draftId>
```

Records:

```bash
opero --json custom-records list <moduleKey> <objectKey> --limit 20
opero --json custom-records list <moduleKey> <objectKey> --expand field1,field2
opero --json custom-records get <moduleKey> <objectKey> <recordId>
opero --json custom-records get <moduleKey> <objectKey> <recordId> --expand field1
opero --json custom-records singleton <moduleKey> <objectKey>
opero custom-records create <moduleKey> <objectKey> --body-file record.json
opero custom-records update <moduleKey> <objectKey> <recordId> --body-file record.json
opero custom-records update-singleton <moduleKey> <objectKey> --body-file record.json
opero custom-records delete <moduleKey> <objectKey> <recordId>
```

## Scripts And Rules

Custom scripts:

```bash
opero --json custom-scripts list --status ACTIVE
opero --json custom-scripts get <id>
opero custom-scripts create --body-file script.json
opero custom-scripts update <id> --body-file script.json
opero custom-scripts archive <id>
opero custom-scripts restore <id>
opero custom-scripts delete <id>
```

Saved queries:

```bash
opero --json queries list --limit 20
opero --json queries list --scope ORGANIZATION
opero --json queries get <id>
opero --json queries schema
opero --json queries validate --body-file query.json
opero queries create --body-file query.json
opero queries update <id> --body-file query.json
opero --json queries execute <id> --body-file execute.json
opero queries delete <id>
```

View layouts:

```bash
opero --json view-layouts list --surface DYNAMIC_OBJECT --mode EDIT --module-key crm --object-key deal
opero --json view-layouts get <layoutId>
opero view-layouts create --body-file layout.json
opero view-layouts update <layoutId> --body-file layout.json
opero view-layouts archive <layoutId>
opero --json view-layouts resolve --surface DYNAMIC_OBJECT --mode EDIT --module-key crm --object-key deal
opero --json view-layouts catalog --surface DYNAMIC_OBJECT --mode EDIT --module-key crm --object-key deal
opero --json view-layouts custom-field-types
opero --json view-layouts surface-capabilities
opero --json view-layouts surface-definitions --surface DYNAMIC_OBJECT
opero --json view-layouts runtime-context-variables <layoutId> --mode EDIT --record-id <recordId>
opero --json view-layouts runtime-data --surface DYNAMIC_OBJECT --mode EDIT --body-file runtime-data.json
opero view-layouts draft save <layoutId> --body-file draft.json
opero --json view-layouts draft staged-field-definitions options <layoutId> <draftFieldDefinitionId>
opero view-layouts publish <layoutId> --body-file publish.json
opero view-layouts assignments replace <layoutId> --body-file assignments.json
opero --json view-layouts versions list <layoutId>
opero --json view-layouts versions get <layoutId> <versionId>
opero view-layouts versions restore-draft <layoutId> <versionId> --body-file restore.json
opero view-layouts runtime dynamic-object records create --surface DYNAMIC_OBJECT --mode CREATE --body-file record.json
opero view-layouts runtime dynamic-object records update <recordId> --surface DYNAMIC_OBJECT --mode EDIT --body-file record.json
opero --json view-layouts runtime dynamic-object relation-tables table-layout --surface DYNAMIC_OBJECT --mode VIEW --body-file table-layout.json
opero --json view-layouts runtime dynamic-object relation-tables target-layout <relationFieldKey> --surface DYNAMIC_OBJECT --mode EDIT --target-mode CREATE
opero --json view-layouts runtime dynamic-object relation-tables query <recordId> <relationFieldKey> --surface DYNAMIC_OBJECT --mode VIEW --body-file relation-query.json
```

Rules:

```bash
opero --json rules config
opero --json rules step-types --search webhook
opero --json rules entity-fields --entity-type custom_record --module-key crm --object-key deal
opero --json rules list --limit 20
opero --json rules get <id>
opero rules create --body-file rule.json
opero rules update <id> --body-file rule.json
opero rules validate-script --body-file script.json
opero rules context-schemas --body-file request.json
opero rules context-schema <id> --step-position 1
opero rules execute <id> --body-file execute.json
opero --json rules executions <id>
opero --json rules execution <id> <execId>
opero rules delete <id>
```

## Files, Attachments, Comments, Service Catalog

Files:

```bash
opero --json files upload --file ./invoice.pdf
opero --json files get <fileId>
opero files download <fileId> --out ./invoice.pdf
opero files download <fileId> --out ./invoice.pdf --force
```

Entity attachments:

```bash
opero --json entity-attachments list --entity-type contractor --entity-id <id>
opero --json entity-attachments create --entity-type contractor --entity-id <id> --file-id <fileId>
opero entity-attachments update <id> --body-file attachment.json
opero entity-attachments delete <id>
```

Entity comments:

```bash
opero --json entity-comments list --entity-type contractor --entity-id <id>
opero --json entity-comments get <id>
opero --json entity-comments create --entity-type contractor --entity-id <id> --body "Please verify billing address"
opero entity-comments update <id> --body-file comment.json
opero entity-comments delete <id>
```

Service catalog:

```bash
opero --json service-catalog list --search hosting
opero --json service-catalog get <id>
opero service-catalog create --body-file item.json
opero service-catalog update <id> --body-file item.json
opero service-catalog archive <id>
opero service-catalog restore <id>
```
