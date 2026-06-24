# CLI Workflows

Use `--json` for automation and `--body-file` for create/update payloads.

## List

```bash
opero --json custom-scripts list --limit 50
```

Useful filters:

```bash
opero --json custom-scripts list --type OPTION_FILTER
opero --json custom-scripts list --status ACTIVE
opero --json custom-scripts list --validation-status INVALID
opero --json custom-scripts list --execution-mode ASYNC
opero --json custom-scripts list --include-archived
```

List commands also support shared list flags:

```bash
--page 1
--limit 20
--count hasMore
--filter-json '{"op":"AND","items":[]}'
--sort-json '[{"field":"updatedAt","direction":"desc"}]'
--columns id,key,name,type,status,validationStatus,usageCount
```

## Inspect

```bash
opero --json custom-scripts get <id>
```

Before editing, inspect:

- `type`
- `code`
- `status`
- `validationStatus`
- `validationErrors`
- `executionMode`
- `dependencies`
- `usageCount`

## Create

Write a payload file:

```bash
opero custom-scripts create --body-file script.json
```

Then inspect the response. If `validationStatus` is `INVALID`, fix the payload
and update the saved script.

## Update

Fetch the current script first:

```bash
opero --json custom-scripts get <id>
```

Write a partial update body:

```bash
opero custom-scripts update <id> --body-file script-update.json
```

If changing `type` or `code`, validation is recomputed on save.

## Archive, Restore, Delete

Archive:

```bash
opero custom-scripts archive <id>
```

Restore:

```bash
opero custom-scripts restore <id>
```

Delete:

```bash
opero custom-scripts delete <id>
```

Deletion archives the custom script and returns no response body. Treat archive
and delete as behavior-affecting operations, especially when `usageCount` is
greater than zero.

## Raw Requests

Prefer curated commands. Use raw requests only if a needed endpoint is missing:

```bash
opero --json request get /v1/custom-scripts
```
