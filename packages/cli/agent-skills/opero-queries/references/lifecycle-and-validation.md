# Lifecycle And Validation

Use curated `opero queries ...` commands for saved-query lifecycle work. Prefer
JSON output for agent workflows.

## Commands

```bash
opero --json queries list --limit 50
opero --json queries list --scope ORGANIZATION
opero --json queries get <id>
opero --json queries schema
opero --json queries validate --body-file query.json
opero queries create --body-file query.json
opero queries update <id> --body-file query.json
opero --json queries execute <id> --body-file execute.json
opero queries delete <id>
```

`queries list` returns SYSTEM and organization queries but omits SQL. Use
`queries get <id>` to inspect SQL, parameters, and inferred `resultSchema`.

## Authoring Workflow

1. Confirm the user's goal and intended consumer.
2. Discover schema with `opero --json queries schema`.
3. Pick tables and columns from the returned schema.
4. Draft read-only SQL with explicit result aliases.
5. Add parameter declarations for every `:paramName`.
6. Put the payload in a JSON file.
7. Validate:

   ```bash
   opero --json queries validate --body-file query.json
   ```

8. Save or update:

   ```bash
   opero queries create --body-file query.json
   opero queries update <id> --body-file query.json
   ```

9. Inspect the saved response for `id`, `key`, `parameters`, SQL, and
   `resultSchema`.
10. Test with representative parameter values:

   ```bash
   opero --json queries execute <id> --body-file execute.json
   ```

## Validation Expectations

`queries validate` returns:

- `valid`: boolean.
- `errors`: validation error messages.
- `referencedTables`: tables extracted from SQL.
- `namedParameters`: named placeholders extracted from SQL.

Validation should reject or flag:

- Empty SQL.
- SQL that does not start with `select` or `with`.
- Multiple statements.
- DML, DDL, session, security, file, extension, or side-effect SQL.
- Dangerous database functions.
- Unknown tables.
- Dynamic tables in system-scoped queries.
- Used parameters that are not declared.
- Declared parameters that are not used.
- Invalid UUID parameter values during execution.

Validation does not prove that the query answers the business question. It only
proves the query is syntactically and operationally acceptable for the saved
query engine.

## Execution Behavior

Saved queries execute through a read-only path with Opero organization context
set server-side. Pass named runtime values in a `params` object. When needed,
choose the execution mode explicitly:

```json
{
  "executionMode": "COMPANY",
  "params": {
    "ownerId": "00000000-0000-0000-0000-000000000000",
    "status": "ACTIVE"
  }
}
```

The agent should not add an `orgId` parameter unless the business data model
truly has an organization field exposed in schema and the consumer explicitly
needs it.

Execution modes:

- `COMPANY`: use the active target company. For organization tokens, select a
  company with `opero companies select <companyId>`, pass `--company-id`, or set
  `OPERO_COMPANY_ID` when the endpoint needs a target company.
- `ORGANIZATION_REPORTING`: run across all companies in the active organization
  and require reporting permission.

Typical execution results include:

- `rows`: array of result objects.
- `rowCount`: number of returned rows.
- `hasMore`: whether more rows are available beyond the applied limit.

Execution surfaces may enforce default limits and offsets. The response contains
`rows`, `rowCount`, and `hasMore`.

## Safe Updates

Before changing an existing query, identify whether the change is breaking:

- SQL logic change: can alter which rows consumers see.
- Parameter rename/removal: can break callers.
- Required parameter addition: can break existing callers.
- Result column removal/rename/type change: can break views, scripts, and
  integrations.
- Key change: can break every key-based consumer.

Prefer backward-compatible changes:

- Add optional parameters with null-aware predicates.
- Add new result columns without removing existing aliases.
- Preserve key and existing parameter names.
- Create a new query when the contract needs to change substantially.

## Delete Safety

`opero queries delete <id>` deletes an organization saved query and returns no
body on success. Treat delete as destructive:

- Fetch the query first with `opero --json queries get <id>`.
- Check whether scripts, view layouts, automation, or integrations use the
  query key.
- Ask for explicit confirmation when the user's intent is ambiguous.

## Troubleshooting

`403` from read commands usually means the API token lacks saved-query read
permission. `403` from create/update/delete/execute usually means the token
lacks the corresponding write or execute permission.

Unknown table or column errors mean schema discovery is stale or the SQL used a
guessed name. Re-run schema discovery and copy `qualifiedName` and column names
exactly.

Parameter mismatch errors mean the SQL placeholders and parameter declarations
do not match. Compare every `:paramName` with the declaration list.

Unexpected empty results are usually a business-logic or parameter-value issue:
check required parameters, optional null handling, joins, archived filters, and
runtime consumer mappings.

Large or slow result sets usually need narrower filters, fewer columns,
deterministic ordering, or a more selective consumer workflow.
