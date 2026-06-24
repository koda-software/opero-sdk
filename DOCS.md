# Opero CLI Documentation

This document describes the current `opero` CLI implementation and the command
contract it is growing toward.

The internal architecture and release planning documents live under `docs/` in
local working copies. That directory is intentionally ignored and is not part of
the public repository.

## Design Model

The CLI is the stable automation surface for the Opero API.

```text
Opero API
  -> opero CLI internal HTTP client
  -> curated commands and raw request commands
  -> MCP server / Codex skill / Claude skill / scripts
```

The CLI does not depend on a public SDK. It uses a small internal HTTP client
for:

- base URL resolution
- bearer token auth
- request timeouts
- query serialization
- JSON request/response handling
- API error normalization
- secret redaction

The internal HTTP client is not a public SDK API.

## Installed Binary

The command name is:

```bash
opero
```

The package name is:

```text
@koda/opero-cli
```

Check the installed command:

```bash
command -v opero
opero --version
opero --help
```

## Shell Autocomplete

The CLI includes oclif autocomplete support for command names and flags.

Run this once after installation:

```bash
opero autocomplete
```

The command detects the current shell when possible and prints setup
instructions. You can also choose explicitly:

```bash
opero autocomplete zsh
opero autocomplete bash
opero autocomplete powershell
```

After setup, command and flag completion works through the shell:

```bash
opero ent<Tab>
opero service-catalog <Tab>
opero files download --<Tab>
```

Autocomplete covers static CLI commands and flags. It does not complete API data
such as contractor IDs, file IDs, or custom module keys.

Public Linux/macOS install:

```bash
curl -fsSL https://raw.githubusercontent.com/koda-software/opero-sdk/main/scripts/install.sh | bash
```

Windows PowerShell install:

```powershell
iwr https://raw.githubusercontent.com/koda-software/opero-sdk/main/scripts/install.ps1 -useb | iex
```

## Configuration

Configuration precedence:

1. CLI flags
2. Environment variables
3. JSON config file
4. Defaults

Environment variables:

```text
OPERO_API_TOKEN
OPERO_BASE_URL
OPERO_TIMEOUT_MS
```

Default base URL:

```text
https://api.kodasoft.pl
```

Local development base URL:

```text
http://localhost:3001
```

The config file is stored under oclif's config directory. On this machine the
path is typically:

```text
~/.config/@koda/opero-cli/config.json
```

Example config:

```json
{
  "baseUrl": "https://api.kodasoft.pl",
  "timeoutMs": 30000,
  "apiToken": "ek_redacted"
}
```

The CLI must never print the full API token.

## Auth Commands

Run interactive setup:

```bash
opero init
```

`opero init` prompts for:

- Opero API base URL
- Opero API token

It validates the token with authenticated `/v1/ping` before saving config.

Run non-interactive setup:

```bash
opero init --base-url https://api.kodasoft.pl --api-token "$OPERO_API_TOKEN"
```

Save only the base URL without token validation:

```bash
opero init --base-url http://localhost:3001 --no-token
```

Manage non-secret CLI settings directly:

```bash
opero config set --base-url https://api.kodasoft.pl
opero config set --base-url http://localhost:3001
```

Show resolved config:

```bash
opero --json config show
```

Validate and save an API token:

```bash
opero auth login --api-token "$OPERO_API_TOKEN"
```

Show auth state:

```bash
opero --json auth status
```

Remove the saved token:

```bash
opero auth logout
```

`auth login` validates the token with authenticated `/v1/ping` before writing
it to config.

## JSON Mode

All automation-oriented commands support JSON output.

The documented agent-friendly form is:

```bash
opero --json doctor
```

oclif's native form also works:

```bash
opero doctor --json
```

JSON mode rules:

- stdout contains JSON only
- non-zero exit codes indicate failure
- secrets are redacted
- errors use a stable machine-readable shape

Example success:

```json
{
  "data": {
    "available": true,
    "source": "config"
  }
}
```

Example error:

```json
{
  "error": {
    "code": "MISSING_AUTH",
    "message": "Missing Opero API token. Set OPERO_API_TOKEN or run opero auth login."
  }
}
```

## Human And Table Output

The default format is human output:

```bash
opero currencies list
```

Human output renders readable summaries and key-value detail. It uses
`picocolors`, so colors are enabled only when the terminal supports them and
standard color-disabling conventions such as `NO_COLOR` are respected.

Use table output when scanning list data:

```bash
opero --table currencies list
opero --table contractors list --limit 20
opero --table config show
```

Table output uses `@oclif/table`, including its terminal-width handling, CI-safe
plain output, and header styling. `--json` takes precedence operationally:
agents and scripts should keep using `--json`.

## Exit Codes

The CLI uses these exit codes:

- `0`: success
- `1`: unexpected CLI failure
- `2`: invalid CLI usage/input
- `3`: config error
- `4`: missing auth
- `5`: API error
- `6`: network/timeout error
- `7`: file read/write error

## Diagnostics

Run this first in agent workflows:

```bash
opero --json doctor
```

`doctor` checks:

- CLI name and version
- resolved base URL
- config path
- auth availability and source
- public `/v1/health`
- authenticated `/v1/ping` when a token is available

Check public health only:

```bash
opero --json health
```

Check authenticated access only:

```bash
opero --json ping
```

## Agent Skills

The CLI ships portable Opero agent skills that can be installed for supported
agent tools.

Current bundled skills:

- `opero-cli`: general Opero CLI usage, diagnostics, output, raw requests, and
  routing to specialized Opero skills.
- `opero-scripts`: Custom Script creation/update workflows, script types,
  context, save-time validation, dependencies, and safe runtime assumptions.

List bundled skills:

```bash
opero skills list
opero --json skills list
```

Install skills for Codex:

```bash
opero skills install codex
```

Install skills for Claude:

```bash
opero skills install claude
```

By default, install commands use user scope:

```text
Codex:  ~/.agents/skills
Claude: ~/.claude/skills
```

Install into the current Git repository instead:

```bash
opero skills install codex --scope repo
opero skills install claude --scope repo
```

Preview an install without writing files:

```bash
opero skills install codex --dry-run
```

Inspect installed skills and see fix commands:

```bash
opero skills doctor
opero --json skills doctor
```

Skills do not store Opero API tokens. Agents using these skills still rely on
the normal `opero` CLI configuration and authentication.

## Updates

Check for a released standalone update:

```bash
opero --json update --check
```

Install the latest released standalone CLI:

```bash
opero update
```

Install a specific version:

```bash
opero update --version v0.2.0
```

The update command prints progress for each phase: checking GitHub Releases,
selecting the matching artifact, downloading the tarball and checksums,
verifying the checksum, extracting the archive, and linking the executable.

The updater downloads release artifacts from GitHub Releases, verifies
`checksums.txt`, extracts the matching OS/architecture tarball, and repoints the
local `opero` symlink or Windows shim.

For human interactive commands, the CLI also performs a small debounced update
check after normal command output. When a newer standalone release exists, it
prints a short stderr notice:

```text
Update available: v0.2.3 (current v0.2.2, linux-x64). Run opero update.
```

Automatic update notices are skipped for:

- `--json`
- CI
- non-TTY stdin/stdout/stderr
- source checkouts
- `opero update`
- `opero autocomplete`

The default debounce interval is 24 hours. Configure or disable it with:

```bash
OPERO_UPDATE_CHECK_INTERVAL_MS=604800000
OPERO_NO_UPDATE_CHECK=1
OPERO_SKIP_UPDATE_CHECK=1
```

The updater refuses to update a source checkout unless `--force` is provided.
For source checkouts, use:

```bash
pnpm install-local
```

## Raw Requests

Raw request commands use the same config, auth, timeout, error handling, and JSON
behavior as curated commands.

Available commands:

```bash
opero request get PATH
opero request post PATH
opero request patch PATH
opero request delete PATH
```

GET example:

```bash
opero --json request get /v1/currencies
```

Query parameters:

```bash
opero --json request get /v1/contractors \
  --query page=1 \
  --query limit=10
```

Request body from a file:

```bash
opero --json request post /v1/contractors --body-file contractor.json
```

Request body from stdin:

```bash
cat contractor.json | opero --json request post /v1/contractors --body-file -
```

Additional non-auth headers:

```bash
opero --json request get /v1/files/<id>/download \
  --header Range=bytes=1000-
```

The CLI rejects manual `Authorization` headers. Use `OPERO_API_TOKEN`,
`--api-token`, or `opero auth login`.

Raw non-GET commands are live writes. The CLI performs the named action
immediately.

## Curated API Commands

Curated commands wrap common API endpoints with stable command names and
agent-friendly flags. Prefer these before using raw `opero request ...`
commands.

### List Flags

List endpoints expose shared query flags where the API supports them:

```bash
--page 1
--limit 20
--count hasMore
--filter-json '{"op":"AND","items":[]}'
--sort-json '[{"field":"createdAt","direction":"desc"}]'
--columns id,name
```

`--filter-json`, `--sort-json`, and JSON-array `--columns` values are validated
before sending the request. A comma-separated `--columns id,name` value is sent
to the API as a JSON array string.

### Reference Data

List supported currencies:

```bash
opero --json currencies list
```

### Contractors

List contractors:

```bash
opero --json contractors list --limit 20
```

Get one contractor:

```bash
opero --json contractors get <id>
```

Create or update a contractor:

```bash
opero contractors create --body-file contractor.json
opero contractors update <id> --body-file contractor.json
```

Update contractor status:

```bash
opero contractors update-status <id> --body-file status.json
```

### Dictionaries

List dictionaries:

```bash
opero --json dictionaries list
```

Get one dictionary:

```bash
opero --json dictionaries get <id>
```

List entries for a dictionary:

```bash
opero --json dictionaries entries <dictionaryId>
```

### Custom Modules

List custom modules:

```bash
opero --json custom-modules list --limit 20
```

Get one custom module:

```bash
opero --json custom-modules get <moduleKey>
```

Create and update custom module metadata:

```bash
opero custom-modules create --body-file module.json
opero custom-modules update <moduleKey> --body-file module.json
```

Preview and perform module deletion:

```bash
opero --json custom-modules delete-impact <moduleKey>
opero custom-modules delete <moduleKey>
```

Deletion is immediate. The CLI sends the API-required `confirmModuleKey` query
using the path module key; it does not prompt.

Read module schema context:

```bash
opero --json custom-modules schema <moduleKey>
```

Manage module-level schema drafts:

```bash
opero --json custom-modules schema-drafts list <moduleKey>
opero --json custom-modules schema-drafts get <moduleKey> <draftId>
opero custom-modules schema-drafts create <moduleKey> --body-file draft.json
opero custom-modules schema-drafts update <moduleKey> <draftId> --body-file draft.json
opero custom-modules schema-drafts validate <moduleKey> <draftId> --body-file validate.json
opero custom-modules schema-drafts apply <moduleKey> <draftId> --body-file apply.json
opero custom-modules schema-drafts delete <moduleKey> <draftId>
```

### Custom Objects

List custom objects inside a module:

```bash
opero --json custom-objects list <moduleKey>
```

Get one custom object:

```bash
opero --json custom-objects get <moduleKey> <objectKey>
```

Read object schema context:

```bash
opero --json custom-objects schema <moduleKey> <objectKey>
opero --json custom-objects schema <moduleKey> <objectKey> --mode edit
```

Preview and perform object deletion:

```bash
opero --json custom-objects delete-impact <moduleKey> <objectKey>
opero custom-objects delete <moduleKey> <objectKey> --body-file delete.json
```

Object deletion uses the API's POST delete endpoint and requires the
confirmation body expected by the API.

Manage object-level schema drafts:

```bash
opero --json custom-objects schema-drafts list <moduleKey> <objectKey>
opero --json custom-objects schema-drafts get <moduleKey> <objectKey> <draftId>
opero custom-objects schema-drafts create <moduleKey> <objectKey> --body-file draft.json
opero custom-objects schema-drafts update <moduleKey> <objectKey> <draftId> --body-file draft.json
opero custom-objects schema-drafts validate <moduleKey> <objectKey> <draftId>
opero custom-objects schema-drafts apply <moduleKey> <objectKey> <draftId> --body-file apply.json
opero custom-objects schema-drafts delete <moduleKey> <objectKey> <draftId>
```

### Custom Records

List records for a custom object:

```bash
opero --json custom-records list <moduleKey> <objectKey> --limit 20
```

Expand record fields:

```bash
opero --json custom-records list <moduleKey> <objectKey> --expand field1,field2
opero --json custom-records get <moduleKey> <objectKey> <recordId> --expand field1
```

Get one custom record:

```bash
opero --json custom-records get <moduleKey> <objectKey> <recordId>
```

Get a singleton custom record:

```bash
opero --json custom-records singleton <moduleKey> <objectKey>
```

Create, update, and delete records:

```bash
opero custom-records create <moduleKey> <objectKey> --body-file record.json
opero custom-records update <moduleKey> <objectKey> <recordId> --body-file record.json
opero custom-records delete <moduleKey> <objectKey> <recordId>
```

Update a singleton custom record:

```bash
opero custom-records update-singleton <moduleKey> <objectKey> --body-file record.json
```

### Custom Scripts

List custom scripts:

```bash
opero --json custom-scripts list --limit 20
opero --json custom-scripts list --type RULE_STEP --status ACTIVE --validation-status VALID
opero --json custom-scripts list --execution-mode SYNC --include-archived
```

Get one custom script:

```bash
opero --json custom-scripts get <id>
```

Create and update custom scripts:

```bash
opero custom-scripts create --body-file script.json
opero custom-scripts update <id> --body-file script.json
```

Archive, restore, and delete custom scripts:

```bash
opero custom-scripts archive <id>
opero custom-scripts restore <id>
opero custom-scripts delete <id>
```

Delete is immediate. It does not prompt for confirmation.

### Files

Upload an attachment file:

```bash
opero --json files upload --file ./invoice.pdf
```

The upload command sends `multipart/form-data` to `POST /v1/files/attachments`
using the OpenAPI field name `file`.

Get file metadata:

```bash
opero --json files get <fileId>
opero --table files get <fileId>
```

Download file bytes:

```bash
opero files download <fileId> --out ./invoice.pdf
```

Downloads stream bytes to disk and refuse to overwrite an existing file by
default:

```bash
opero files download <fileId> --out ./invoice.pdf --force
```

Create missing parent directories explicitly:

```bash
opero files download <fileId> --out ./tmp/files/invoice.pdf --create-dirs
```

Download a byte range:

```bash
opero files download <fileId> --out ./part.bin --range bytes=0-1023
```

### Service Catalog

List service catalog items:

```bash
opero --json service-catalog list --limit 20
opero --table service-catalog list --search hosting
```

Get one service catalog item:

```bash
opero --json service-catalog get <id>
```

Create and update service catalog items:

```bash
opero service-catalog create --body-file item.json
opero service-catalog update <id> --body-file item.json
```

Archive and restore items:

```bash
opero service-catalog archive <id>
opero service-catalog restore <id>
```

Archive and restore are immediate PATCH requests. They do not prompt for
confirmation.

### Entity Attachments

List attachments for an entity:

```bash
opero --json entity-attachments list --entity-type contractor --entity-id <id>
opero --json entity-attachments list --entity-type custom_record.crm.deal --entity-id <id>
```

Attach an uploaded file to an entity:

```bash
opero --json entity-attachments create \
  --entity-type contractor \
  --entity-id <id> \
  --file-id <fileId>
```

Optional attachment fields:

```bash
opero entity-attachments create \
  --entity-type contractor \
  --entity-id <id> \
  --file-id <fileId> \
  --kind contract \
  --display-name "Signed contract" \
  --description "Customer-provided source document" \
  --metadata-json '{"source":"cli"}' \
  --position 0
```

Update attachment metadata:

```bash
opero entity-attachments update <id> --body-file attachment.json
```

Delete an attachment link:

```bash
opero entity-attachments delete <id>
```

Delete is immediate. It does not prompt for confirmation.

The current OpenAPI snapshot does not expose `GET /v1/entity-attachments/{id}`,
so there is no `entity-attachments get` command.

### Entity Comments

List comments for an entity:

```bash
opero --json entity-comments list --entity-type contractor --entity-id <id>
opero --json entity-comments list --entity-type custom_record.crm.deal --entity-id <id>
```

List supports the shared pagination/query flags:

```bash
opero --table entity-comments list \
  --entity-type contractor \
  --entity-id <id> \
  --limit 20
```

Get one comment:

```bash
opero --json entity-comments get <id>
```

Create a comment from a plain body string:

```bash
opero --json entity-comments create \
  --entity-type contractor \
  --entity-id <id> \
  --body "Please verify billing address"
```

Add metadata during create:

```bash
opero entity-comments create \
  --entity-type contractor \
  --entity-id <id> \
  --body "Please verify billing address" \
  --metadata-json '{"source":"cli"}'
```

Create or update from a JSON file:

```bash
opero entity-comments create \
  --entity-type contractor \
  --entity-id <id> \
  --body-file comment.json

opero entity-comments update <id> --body-file comment.json
```

Delete a comment:

```bash
opero entity-comments delete <id>
```

Delete is immediate. It does not prompt for confirmation.

### Rules

Read rule-builder configuration:

```bash
opero --json rules config
opero --json rules step-types --search webhook --limit 20
opero --json rules entity-fields --entity-type contractor
opero --json rules entity-fields --entity-type custom_record --module-key crm --object-key deal
```

Compute draft context schemas and validate scripts:

```bash
opero rules context-schemas --body-file context-request.json
opero rules validate-script --body-file script-request.json
```

List and read rules:

```bash
opero --json rules list --limit 20
opero --json rules get <id>
```

Create, update, execute, and delete rules:

```bash
opero rules create --body-file rule.json
opero rules update <id> --body-file rule.json
opero rules execute <id> --body-file execute.json
opero rules delete <id>
```

`rules execute` runs a manual active rule synchronously as the API token actor.
`rules delete` is immediate.

Read context schema for a saved step:

```bash
opero --json rules context-schema <id> --step-position 1
```

Read execution history:

```bash
opero --json rules executions <id>
opero --json rules execution <id> <execId>
```

Find rules related to custom data:

```bash
opero --json rules related-custom-module <moduleKey>
opero --json rules related-custom-object <moduleKey> <objectKey>
opero --json rules related-custom-field <fieldDefinitionId>
```

## Current Implemented Command Surface

```text
opero doctor
opero health
opero init
opero ping
opero auth login
opero auth logout
opero auth status
opero config set
opero config show
opero contractors create
opero contractors get
opero contractors list
opero contractors update
opero contractors update-status
opero currencies list
opero custom-modules create
opero custom-modules delete
opero custom-modules delete-impact
opero custom-modules get
opero custom-modules list
opero custom-modules schema
opero custom-modules schema-drafts apply
opero custom-modules schema-drafts create
opero custom-modules schema-drafts delete
opero custom-modules schema-drafts get
opero custom-modules schema-drafts list
opero custom-modules schema-drafts update
opero custom-modules schema-drafts validate
opero custom-modules update
opero custom-objects delete
opero custom-objects delete-impact
opero custom-objects get
opero custom-objects list
opero custom-objects schema
opero custom-objects schema-drafts apply
opero custom-objects schema-drafts create
opero custom-objects schema-drafts delete
opero custom-objects schema-drafts get
opero custom-objects schema-drafts list
opero custom-objects schema-drafts update
opero custom-objects schema-drafts validate
opero custom-records create
opero custom-records delete
opero custom-records get
opero custom-records list
opero custom-records singleton
opero custom-records update
opero custom-records update-singleton
opero custom-scripts archive
opero custom-scripts create
opero custom-scripts delete
opero custom-scripts get
opero custom-scripts list
opero custom-scripts restore
opero custom-scripts update
opero dictionaries entries
opero dictionaries get
opero dictionaries list
opero entity-attachments create
opero entity-attachments delete
opero entity-attachments list
opero entity-attachments update
opero entity-comments create
opero entity-comments delete
opero entity-comments get
opero entity-comments list
opero entity-comments update
opero files download
opero files get
opero files upload
opero request get
opero request post
opero request patch
opero request delete
opero rules config
opero rules context-schema
opero rules context-schemas
opero rules create
opero rules delete
opero rules entity-fields
opero rules execution
opero rules executions
opero rules execute
opero rules get
opero rules list
opero rules related-custom-field
opero rules related-custom-module
opero rules related-custom-object
opero rules step-types
opero rules update
opero rules validate-script
opero service-catalog archive
opero service-catalog create
opero service-catalog get
opero service-catalog list
opero service-catalog restore
opero service-catalog update
opero update
```

## OpenAPI Workflow

Pinned contract:

```text
openapi/external-v1.openapi.json
```

Pull from local backend:

```bash
pnpm openapi:pull:local
```

Pull from production:

```bash
pnpm openapi:pull:prod
```

Validate the pinned document:

```bash
pnpm openapi:check
```

Print a quick operation/tag summary:

```bash
pnpm openapi:summary
```

Generate TypeScript types:

```bash
pnpm openapi:types
```

Generated types are compile-time helpers only. They do not define the public CLI
command surface.

## Development Workflow

Install dependencies:

```bash
pnpm install
```

Run all checks:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Build standalone tarballs with bundled Node runtimes:

```bash
pnpm pack:standalone
```

The standalone pack command currently targets:

- `linux-x64`
- `darwin-x64`
- `darwin-arm64`
- `win32-x64`

Artifacts are copied to:

```text
dist/standalone/
```

The generated artifact directory includes:

```text
checksums.txt
```

To package a subset of targets, set `OPERO_PACK_TARGETS`:

```bash
OPERO_PACK_TARGETS=linux-x64 pnpm pack:standalone
```

The script uses `OPERO_PACK_SHA` when provided. In this not-yet-git-initialized
workspace it defaults to `0000000`, which keeps oclif's tarball naming stable.

Run one command from source:

```bash
node packages/cli/bin/run.js --json doctor --base-url http://localhost:3001
```

Install the local command on PATH:

```bash
pnpm install-local
```

Smoke-test from outside the repo:

```bash
cd /tmp
opero --version
opero --json doctor --base-url http://localhost:3001
opero --json health --base-url http://localhost:3001
```

## Agent Usage Rules

Codex, Claude, MCP tools, and scripts should follow these rules:

- Start with `opero --json doctor`.
- Prefer curated read commands when available.
- Use `opero --json request get ...` when a curated read command does not exist.
- Do not call the Opero API directly from skills or MCP wrappers.
- Do not run write commands unless the user explicitly requested that write.
- Always use `--json` for machine parsing.
- Never print API tokens or full config secrets.

## Security Notes

- API tokens are bearer tokens.
- The CLI redacts tokens in output.
- `--api-token` is supported for explicit one-off use, but env/config are better
  for routine use.
- Raw request commands reject manual `Authorization` headers.
- Non-idempotent writes are not retried automatically.
