# Output And Errors

Use this reference when writing scripts around `opero`, parsing command output,
or diagnosing command failures.

## Output Modes

Default human output:

```bash
opero currencies list
```

Table output for scanning:

```bash
opero --table currencies list
opero --table contractors list --limit 20
opero --table config show
```

JSON output for agents and scripts:

```bash
opero --json doctor
opero --json contractors list --limit 20
```

Rules for automation:

- Prefer `--json`.
- Treat stdout as JSON only when `--json` is used.
- Use non-zero exit codes as failure signals.
- Do not scrape default human output unless the user explicitly asks for a
  human-facing result.

## JSON Shape

Successful commands normally return an API envelope or command envelope:

```json
{
  "data": {}
}
```

Errors use:

```json
{
  "error": {
    "code": "MISSING_AUTH",
    "message": "Missing Opero API token. Set OPERO_API_TOKEN or run opero auth login."
  }
}
```

Some API errors include `status` and `details`.

## Exit Codes

```text
0 success
1 unexpected CLI failure
2 invalid CLI usage/input
3 config error
4 missing auth
5 API error
6 network/timeout error
7 file read/write error
```

## Secret Handling

The CLI redacts known secret-looking text in errors. Still, do not print,
commit, or store API tokens. Use `opero --json auth status` when checking auth
state.

## Update Notices

Human interactive commands may print update notices to stderr. They are skipped
for `--json`, CI, non-TTY usage, source checkouts, `opero update`, and
`opero autocomplete`.
