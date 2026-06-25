---
name: opero-cli
description: Use when working with the Opero CLI, configuring Opero API access, running Opero commands, scripting Opero API operations, troubleshooting CLI/API errors, deciding whether to use curated commands or raw requests, or routing an Opero task to a more specific Opero skill.
---

# Opero CLI

Use the `opero` command as the stable automation surface for the Opero external
API. Prefer the CLI over direct HTTP calls unless the user explicitly asks for a
different integration path.

## First Steps

1. Confirm the CLI is available when command execution is possible:

   ```bash
   command -v opero
   opero --version
   opero help
   ```

2. For agent workflows, inspect health and auth with JSON output:

   ```bash
   opero --json doctor
   ```

3. Use `opero --json ...` for automation. Treat stdout as the machine-readable
   result and non-zero exit codes as failures.

4. Prefer curated commands such as `opero contractors list` or
   `opero custom-scripts create` before using `opero request ...`.

5. Use raw requests only when no curated command covers the needed endpoint.

6. For product documentation beyond this skill, use:

   - Full documentation: `https://docs.kodasoft.pl`
   - Agent-friendly summary: `https://docs.kodasoft.pl/llms.txt`

## References

Read only the reference needed for the task:

- `references/configuration.md`: install checks, base URL, token setup, config
  precedence, and auth status.
- `references/output-and-errors.md`: JSON/table output, error shape, exit codes,
  and secret handling.
- `references/curated-commands.md`: command families and common examples.
- `references/raw-requests.md`: `opero request` syntax, query/header/body rules,
  and raw-write safety.
- `references/troubleshooting.md`: diagnosis workflow for config, auth, network,
  API, JSON, and file errors.
- `references/specialized-skills.md`: when to use specialized Opero skills for
  workflows, view layouts, scripts, and SQL queries.

## Default Procedure

1. Identify whether the task is read-only or a live write.
2. If the task belongs to a specialized Opero domain, check
   `references/specialized-skills.md` and use that skill if it is installed.
3. Run `opero --json doctor` before authenticated work unless recent context
   already proves config, auth, and API reachability.
4. Inspect current state before changing data.
5. For writes, prepare JSON payloads in files and pass them with `--body-file`.
6. Validate before apply/create/update/delete when a validation or impact command
   exists.
7. Verify the result with a read command after the write.

## Safety Rules

- Never print full API tokens.
- Do not store API tokens in generated skill files, examples, payloads, logs, or
  docs.
- Do not pass `Authorization` manually to raw requests. Use `OPERO_API_TOKEN`,
  `--api-token`, or saved auth from `opero auth login`.
- Treat raw non-GET requests and delete/archive/restore commands as live writes.
- Ask for confirmation before destructive actions when the user request is
  ambiguous.
- Keep `--json` output clean for agents and scripts.
