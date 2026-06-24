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
OPERO_TIMEOUT_MS
```

Show resolved config:

```bash
opero --json config show
```

## Diagnostics

Run this before authenticated workflows:

```bash
opero --json doctor
```

`doctor` reports CLI version, resolved base URL, config path, auth availability,
public health, and authenticated ping when a token is available.
