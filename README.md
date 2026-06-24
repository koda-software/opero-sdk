# Opero CLI

This repository contains the first tooling surface for the Opero external API:
the `opero` command-line interface.

The current direction is CLI-first. The CLI talks to the API directly through a
small internal HTTP layer. A public SDK is not required for the first version.
Future MCP servers, Codex skills, Claude skills, scripts, and CI jobs should
call this CLI instead of duplicating API access logic.

## Requirements

- Node.js `>=18`
- pnpm
- Access to an Opero API endpoint:
  - local: `http://localhost:3001`
  - production: `https://api.kodasoft.pl`
- Opero API token for authenticated commands

## Install

Public standalone install for Linux/macOS:

```bash
curl -fsSL https://raw.githubusercontent.com/koda-software/opero-sdk/main/scripts/install.sh | bash
```

From a source checkout:

```bash
pnpm install
pnpm install-local
```

Make sure `~/.local/bin` is on `PATH`:

```bash
command -v opero
opero --version
```

Enable shell autocomplete:

```bash
opero autocomplete
```

You can also request a specific shell:

```bash
opero autocomplete zsh
opero autocomplete bash
opero autocomplete powershell
```

## Configure

Set the target API endpoint:

```bash
opero init
```

`opero init` prompts for the API base URL and API token, validates the token with
`/v1/ping`, and saves the config.

For non-interactive setup:

```bash
opero init --base-url https://api.kodasoft.pl --api-token "$OPERO_API_TOKEN"
```

To save only the base URL without token validation:

```bash
opero init --base-url http://localhost:3001 --no-token
```

Authenticate with an API token:

```bash
opero auth login --api-token "$OPERO_API_TOKEN"
```

`auth login` validates the token with `/v1/ping` before saving it to the JSON
config file.

You can also use environment variables for one-off commands:

```bash
OPERO_BASE_URL=http://localhost:3001 \
OPERO_API_TOKEN=ek_... \
opero --json ping
```

## First Commands

Check CLI config, auth, and API reachability:

```bash
opero --json doctor
```

Check unauthenticated API health:

```bash
opero --json health
```

Check authenticated API access:

```bash
opero --json ping
```

Show auth status without printing the full token:

```bash
opero --json auth status
```

Show resolved config:

```bash
opero --json config show
```

Check for a released standalone update:

```bash
opero --json update --check
```

## Output Formats

The CLI supports three output formats:

```bash
opero currencies list
opero --table currencies list
opero --json currencies list
```

- default human output uses readable summaries with color when the terminal
  supports it
- `--table` uses oclif table rendering for scanning lists and objects
- `--json` is stable machine-readable API output for scripts and agents

## Curated API Commands

Use curated commands for common API workflows. They use the same config, auth,
timeouts, JSON mode, and error handling as raw requests.

```bash
opero --json currencies list

opero --json contractors list --limit 20
opero --json contractors get <id>
opero contractors create --body-file contractor.json
opero contractors update <id> --body-file contractor.json
opero contractors update-status <id> --body-file status.json

opero --json dictionaries list
opero --json dictionaries get <id>
opero --json dictionaries entries <dictionaryId>

opero --json custom-modules list
opero --json custom-modules get <moduleKey>
opero custom-modules create --body-file module.json
opero custom-modules update <moduleKey> --body-file module.json
opero custom-modules delete-impact <moduleKey>
opero custom-modules delete <moduleKey>
opero custom-modules schema <moduleKey>
opero custom-modules schema-drafts create <moduleKey> --body-file draft.json
opero custom-modules schema-drafts apply <moduleKey> <draftId> --body-file apply.json

opero --json custom-objects list <moduleKey>
opero --json custom-objects get <moduleKey> <objectKey>
opero custom-objects schema <moduleKey> <objectKey>
opero custom-objects delete-impact <moduleKey> <objectKey>
opero custom-objects schema-drafts validate <moduleKey> <objectKey> <draftId>

opero --json custom-records list <moduleKey> <objectKey> --expand field1,field2
opero --json custom-records get <moduleKey> <objectKey> <recordId> --expand field1
opero --json custom-records singleton <moduleKey> <objectKey>
opero custom-records create <moduleKey> <objectKey> --body-file record.json
opero custom-records update <moduleKey> <objectKey> <recordId> --body-file record.json
opero custom-records update-singleton <moduleKey> <objectKey> --body-file record.json
```

File commands:

```bash
opero --json files upload --file ./invoice.pdf
opero --json files get <fileId>
opero files download <fileId> --out ./invoice.pdf
```

Downloads refuse to overwrite existing files unless `--force` is provided. Use
`--create-dirs` when the output parent directory should be created.

Service catalog commands:

```bash
opero --json service-catalog list --search hosting
opero --json service-catalog get <id>
opero service-catalog create --body-file item.json
opero service-catalog update <id> --body-file item.json
opero service-catalog archive <id>
opero service-catalog restore <id>
```

Entity attachment commands:

```bash
opero --json entity-attachments list --entity-type contractor --entity-id <id>
opero --json entity-attachments create --entity-type contractor --entity-id <id> --file-id <fileId>
opero entity-attachments update <id> --body-file attachment.json
opero entity-attachments delete <id>
```

Entity comment commands:

```bash
opero --json entity-comments list --entity-type contractor --entity-id <id>
opero --json entity-comments get <id>
opero --json entity-comments create --entity-type contractor --entity-id <id> --body "Please verify billing address"
opero entity-comments update <id> --body-file comment.json
opero entity-comments delete <id>
```

Rule commands:

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

List commands support API pagination/query flags where the endpoint supports
them:

```bash
--page 1
--limit 20
--count hasMore
--filter-json '{"op":"AND","items":[]}'
--sort-json '[{"field":"createdAt","direction":"desc"}]'
--columns id,name
```

## Raw API Requests

The CLI includes a raw request escape hatch so every API endpoint is reachable
before a curated command exists.

```bash
opero --json request get /v1/currencies
opero --json request get /v1/contractors --query limit=10
opero --json request post /v1/contractors --body-file contractor.json
opero --json request patch /v1/contractors/<id> --body-file contractor.json
opero --json request delete /v1/entity-comments/<id>
```

Raw non-GET requests are live writes. The CLI does not ask for an extra
confirmation.

## OpenAPI Contract

The external API OpenAPI document is pinned at:

```text
openapi/external-v1.openapi.json
```

Useful scripts:

```bash
pnpm openapi:pull:local
pnpm openapi:pull:prod
pnpm openapi:check
pnpm openapi:summary
pnpm openapi:types
```

Current note: public releases should use the production OpenAPI snapshot.

## Development

Run checks:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm openapi:check
```

Build standalone oclif tarballs with bundled Node runtimes:

```bash
pnpm pack:standalone
```

Artifacts are copied to:

```text
dist/standalone/
```

Release artifacts include `checksums.txt` for installer and updater
verification.

Run the CLI from source:

```bash
node packages/cli/bin/run.js --help
node packages/cli/bin/run.js --json doctor --base-url http://localhost:3001
```

## Documentation

- [CLI documentation](DOCS.md)
