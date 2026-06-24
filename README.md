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

From this repository:

```bash
pnpm install
pnpm install-local
```

Make sure `~/.local/bin` is on `PATH`:

```bash
command -v opero
opero --version
```

## Configure

Set the target API endpoint:

```bash
opero init --base-url https://api.kodasoft.pl
```

For local backend development:

```bash
opero init --base-url http://localhost:3001
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

## Raw API Requests

The initial CLI includes a raw request escape hatch so every API endpoint is
reachable before curated resource commands are implemented.

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

Current note: local and production may differ during backend development. The
local snapshot currently includes `Custom Scripts` endpoints that production may
not expose yet.

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

Run the CLI from source:

```bash
node packages/cli/bin/run.js --help
node packages/cli/bin/run.js --json doctor --base-url http://localhost:3001
```

## Documentation

- [CLI documentation](DOCS.md)
- [CLI-first technical specification](docs/cli-first-technical-spec.md)
- [SDK tooling comparison](docs/sdk-tooling-comparison.md)
