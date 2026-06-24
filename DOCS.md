# Opero CLI Documentation

This document describes the current `opero` CLI implementation and the command
contract it is growing toward.

The internal architecture and release planning documents live under `docs/` in
local working copies. That directory is intentionally ignored and is not part of
the public repository.

## Design Model

The CLI is the stable automation surface for the Opero external API.

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

The updater downloads release artifacts from GitHub Releases, verifies
`checksums.txt`, extracts the matching OS/architecture tarball, and repoints the
local `opero` symlink or Windows shim.

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

## Curated Read Commands

Curated read commands wrap common GET endpoints with stable command names and
agent-friendly flags. Prefer these before using `opero request get`.

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

### Custom Objects

List custom objects inside a module:

```bash
opero --json custom-objects list <moduleKey>
```

Get one custom object:

```bash
opero --json custom-objects get <moduleKey> <objectKey>
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
opero contractors get
opero contractors list
opero currencies list
opero custom-modules get
opero custom-modules list
opero custom-objects get
opero custom-objects list
opero custom-records get
opero custom-records list
opero custom-records singleton
opero dictionaries entries
opero dictionaries get
opero dictionaries list
opero entity-attachments create
opero entity-attachments delete
opero entity-attachments list
opero entity-attachments update
opero files download
opero files get
opero files upload
opero request get
opero request post
opero request patch
opero request delete
opero service-catalog archive
opero service-catalog create
opero service-catalog get
opero service-catalog list
opero service-catalog restore
opero service-catalog update
opero update
```

Curated coverage for rules and entity-comments is planned next. Until then, use
`opero request ...` for endpoints without curated commands.

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
