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

## Company Targeting

Use `--company-id <companyId>` or `OPERO_COMPANY_ID=<companyId>` when an
organization token needs to target company-scoped runtime data. The CLI sends
the value as `X-Company-Id`.

For repeated work, save a default target company:

```bash
opero companies select <companyId>
```

`--company-id` and `OPERO_COMPANY_ID` override the selected company for one
command.

## Reference Data

```bash
opero --json currencies list
opero --json dictionaries list
opero --json dictionaries get <id>
opero dictionaries create --body-file dictionary.json
opero dictionaries update <id> --body-file dictionary.json
opero dictionaries delete <id>
opero --json dictionaries entries <dictionaryId>
opero --json dictionaries entries get <dictionaryId> <entryId>
opero dictionaries entries export <dictionaryId> --format json --out entries.json
opero dictionaries entries import <dictionaryId> --file entries.csv --strategy MERGE
```

## Contractors

```bash
opero --json contractors list --limit 20
opero --json contractors get <id>
opero contractors create --body-file contractor.json
opero contractors update <id> --body-file contractor.json
opero contractors update-status <id> --body-file status.json
```

## Companies

Company commands manage companies in the API token organization. They require
ORGANIZATION API tokens; COMPANY tokens are rejected. These endpoints do not use
`X-Company-Id`.

```bash
opero --json companies list
opero --json companies list --filter status=ACTIVE --sort createdAt:asc
opero --json companies get <companyId>
opero companies select <companyId>
opero companies create --name "Acme Poland" --slug acme-poland
opero companies create --body-file company.json
opero companies update <companyId> --name "Acme Poland Updated"
opero companies update <companyId> --body-file company.json
opero companies delete <companyId>
opero companies delete <companyId> --yes
```

Expected permissions are `api.companies.read` for reads and
`api.companies.manage` for writes.

Delete prompts for confirmation unless `--yes` is passed. Backend constraints
can block delete with `409`, for example default companies or companies with
active memberships.

`companies select` stores a default company ID for company-scoped runtime
endpoints. It does not call the API and does not affect company-management
endpoint scoping.

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

Objects:

```bash
opero --json custom-objects list <moduleKey>
opero --json custom-objects get <moduleKey> <objectKey>
opero --json custom-objects schema <moduleKey> <objectKey>
opero --json custom-objects schema <moduleKey> <objectKey> --mode edit
opero --json custom-objects field-types
opero --json custom-objects field-types get <type>
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

Workflows:

```bash
opero --json workflow-templates list
opero workflow-templates create-workflow <templateId> --body-file workflow.json
opero --json workflows list
opero workflows create --body-file workflow.json
opero --json workflows get <workflowId>
opero workflows update <workflowId> --body-file metadata.json
opero --json workflows draft get <workflowId>
opero workflows draft save <workflowId> --body-file draft.json
opero workflows publish <workflowId> --body-file publish.json
opero workflows discard-draft <workflowId>
opero --json workflows publications list <workflowId>
opero workflows publications create-draft <workflowId> <publicationId>
opero --json workflows runtime create-options --target-type DYNAMIC_OBJECT_RECORD --module-key crm --object-key deal
opero --json workflows runtime target-state <recordId> --target-type DYNAMIC_OBJECT_RECORD --module-key crm --object-key deal
opero workflows runtime start <recordId> --target-type DYNAMIC_OBJECT_RECORD --module-key crm --object-key deal --body-file start.json
opero --json workflows runtime get <instanceId>
opero --json workflows runtime replay <instanceId>
opero workflows runtime update-author <instanceId> --body-file author.json
opero workflows runtime execute-transition <instanceId> <transitionId> --body-file transition.json
opero --json workflows runtime history <instanceId>
opero --json workflows tasks list
opero --json workflows tasks get <taskId>
opero workflows tasks reassign <taskId> --body-file reassign.json
opero --json workflows assignment-candidates lookup --source-type stage --source-id <stageId> --candidate-type membership
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
opero --json rules related-custom-module <moduleKey>
opero --json rules related-custom-object <moduleKey> <objectKey>
opero --json rules related-custom-field <fieldDefinitionId>
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
