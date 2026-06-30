# Configuration

Use this reference when the task involves installing, detecting, configuring, or
authenticating the Opero CLI.

## Binary

The installed command is:

```bash
opero
```

Check availability:

```bash
command -v opero
opero --version
opero --help
```

## Help And Command Discovery

Supported help patterns:

```bash
opero help
opero --help
opero <topic> --help
opero <topic> <command> --help
```

`opero help` and `opero --help` show all topics and top-level commands.
`opero <topic> --help` shows commands under a topic, and
`opero <topic> <command> --help` shows arguments and flags for one command.

Do not use unsupported forms such as `opero help <topic>` or
`opero <topic> help`; these are parsed as command names and fail.

When help output is not enough, inspect with read commands, schema/catalog
commands, or `opero request get ...` before falling back to source or OpenAPI
inspection.

## Base URL

Common endpoints:

```text
production: https://api.kodasoft.pl
local:      http://localhost:3001
```

The default base URL is production.

Set or initialize the base URL:

```bash
opero init
opero init --base-url https://api.kodasoft.pl --api-token "$OPERO_API_TOKEN"
opero init --base-url http://localhost:3001 --no-token
opero config set --base-url http://localhost:3001
```

## Auth

Authenticated commands need an Opero API token. Use one of:

```bash
OPERO_API_TOKEN=ek_... opero --json ping
opero --api-token "$OPERO_API_TOKEN" --json ping
opero auth login --api-token "$OPERO_API_TOKEN"
```

`opero auth login` validates the token with authenticated `/v1/ping` before
saving it.

Show auth state without printing the full token:

```bash
opero --json auth status
```

Remove the saved token:

```bash
opero auth logout
```

## Resolution Order

Configuration precedence:

1. CLI flags.
2. Environment variables.
3. JSON config file.
4. Defaults.

Environment variables:

```text
OPERO_API_TOKEN
OPERO_BASE_URL
OPERO_COMPANY_ID
OPERO_TIMEOUT_MS
```

Show resolved config:

```bash
opero --json config show
```

## Company Targeting

Some runtime and company-scoped endpoints require a target company when the API
token is organization-scoped. For repeated work, save a selected company:

```bash
opero companies select <companyId>
```

For one-off commands, use either:

```bash
opero --company-id <companyId> --json workflows tasks list
OPERO_COMPANY_ID=<companyId> opero --json custom-records list <moduleKey> <objectKey>
```

The CLI sends this as `X-Company-Id`. Do not add that header manually for
curated commands. For raw requests, prefer `--company-id`; use
`--header X-Company-Id=<companyId>` only when testing low-level behavior.

Resolution order is `--company-id`, then `OPERO_COMPANY_ID`, then the company
saved by `opero companies select`.

## Diagnostics

Run this before authenticated workflows:

```bash
opero --json doctor
```

`doctor` reports CLI version, resolved base URL, config path, auth availability,
public health, and authenticated ping when a token is available.
