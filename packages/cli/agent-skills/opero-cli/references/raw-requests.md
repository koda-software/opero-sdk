# Raw Requests

Use raw requests when a needed Opero API endpoint is not covered by a curated
command.

Raw request commands use the same config, auth, timeout, JSON behavior, and
error handling as curated commands.

## Commands

```bash
opero request get PATH
opero request post PATH
opero request patch PATH
opero request delete PATH
```

The path must start with `/`.

## Examples

GET:

```bash
opero --json request get /v1/currencies
```

Query parameters:

```bash
opero --json request get /v1/contractors \
  --query page=1 \
  --query limit=10
```

Repeated `--query key=value` flags are allowed. Repeating the same key sends
multiple values for that key.

JSON body from a file:

```bash
opero --json request post /v1/contractors --body-file contractor.json
```

JSON body from stdin:

```bash
cat contractor.json | opero --json request post /v1/contractors --body-file -
```

Additional non-auth headers:

```bash
opero --json request get /v1/files/<id>/download \
  --header Range=bytes=1000-
```

## Rules

- Do not pass `Authorization` manually. The CLI rejects it.
- Use `OPERO_API_TOKEN`, `--api-token`, or `opero auth login` for auth.
- Raw non-GET commands are live writes.
- The CLI does not ask for extra confirmation before raw writes.
- Validate JSON body files before sending if the user is asking for a risky
  update.
- Prefer an API validation endpoint when one exists.

## Choosing Raw Requests

Use raw requests when:

- The OpenAPI contract or docs mention an endpoint but no curated command exists.
- A user asks for a low-level API operation.
- A specialized skill has identified the exact endpoint and payload.

Do not use raw requests when:

- A curated command exists for the same operation.
- The task is destructive and the user intent is ambiguous.
- You cannot identify the expected request body shape.
