# Troubleshooting

Use this reference when an Opero CLI command fails or the environment is
uncertain.

## Standard Diagnosis

Run:

```bash
opero --json doctor
```

Then inspect:

- CLI version.
- Resolved base URL.
- Config path.
- Auth availability and source.
- Public health result.
- Authenticated ping result.

If `doctor` is unavailable or not enough, run narrower checks:

```bash
opero --json health
opero --json ping
opero --json auth status
opero --json config show
```

## Common Failures

### Missing CLI

Symptoms:

```text
opero: command not found
```

Check:

```bash
command -v opero
```

If missing, install the CLI or use the repository development command if working
inside the source checkout.

### Missing Auth

Error code:

```text
MISSING_AUTH
```

Fix:

```bash
opero auth login --api-token "$OPERO_API_TOKEN"
```

For one command:

```bash
OPERO_API_TOKEN=ek_... opero --json ping
```

### Config Error

Error code:

```text
CONFIG_ERROR
```

Check the resolved config and config path:

```bash
opero --json config show
```

If the config file is invalid JSON, repair or remove it. Do not print saved
tokens.

### Invalid JSON Body

Error code:

```text
INVALID_JSON
```

Check the file passed to `--body-file`. It must contain valid JSON. When reading
from stdin with `--body-file -`, ensure the piped content is JSON.

### File Error

Error code:

```text
FILE_ERROR
```

Check that the body file, upload file, or download output path exists and has
the expected permissions. Downloads refuse to overwrite existing files unless
`--force` is provided.

### API Error

Error code:

```text
API_ERROR
```

Inspect `error.status`, `error.code`, `error.message`, and `error.details` in
JSON output. If the request was a write, inspect current state before retrying.

### Network Or Timeout

Error codes:

```text
NETWORK_ERROR
TIMEOUT
```

Check:

```bash
opero --json health
opero --json config show
```

For local development, confirm the API is running on the configured base URL.
Increase timeout only when the operation is expected to be slow:

```bash
opero --timeout-ms 60000 --json <command>
```

## Retry Rules

- Retry read-only commands after transient network failures.
- Do not blindly retry writes.
- For write failures, inspect server state before deciding whether to retry.
- If an operation may be destructive, ask the user before continuing.
