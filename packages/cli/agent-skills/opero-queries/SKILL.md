---
name: opero-queries
description: Use when creating, reviewing, explaining, validating, or troubleshooting Opero saved SQL queries, including schema discovery, queryable tables and columns, dynamic object tables, SQL parameters, result shape, saved query keys, execution consumers, and safe query lifecycle.
---

# Opero Queries

Use this skill for Opero saved SQL queries: reusable, organization-scoped
read-only SQL definitions used by views, scripts, automation, reporting, and
other product surfaces that need structured data from Opero.

Use the curated `opero queries ...` commands for saved-query work:

```bash
opero --json queries list
opero --json queries get <id>
opero --json queries schema
opero queries validate --body-file query.json
opero queries create --body-file query.json
opero queries update <id> --body-file query.json
opero queries execute <id> --body-file execute.json
opero queries delete <id>
```

## References

Read only the reference needed for the task:

- `references/concepts.md`: saved query purpose, scope, keys, consumers, and
  lifecycle.
- `references/schema-discovery.md`: `opero queries schema`, response shape,
  static tables, dynamic tables, and how to choose table/column names.
- `references/parameters.md`: named parameters, supported types, required vs
  optional values, defaults, and consumer mappings.
- `references/sql-authoring.md`: safe SQL patterns, joins, filters, aggregates,
  CTEs, pagination, result shape, and forbidden patterns.
- `references/lifecycle-and-validation.md`: list, inspect, validate, create,
  update, execute, delete, dependency safety, and troubleshooting.
- `references/payloads-and-examples.md`: example SQL, parameter declarations,
  saved query payloads, and common query templates.

## Default Procedure

1. Run `opero --json doctor` unless current context already proves auth and API
   reachability.
2. Discover the queryable schema before writing SQL:

   ```bash
   opero --json queries schema
   ```

3. Read `references/schema-discovery.md` and identify the exact
   `qualifiedName` values and columns to use.
4. Read `references/parameters.md` before adding or changing any `:paramName`
   placeholders.
5. Read `references/sql-authoring.md` before writing nontrivial joins,
   aggregates, CTEs, or filters.
6. Keep SQL read-only and organization-safe. Prefer explicit columns and stable
   result aliases.
7. Validate the draft before saving:

   ```bash
   opero --json queries validate --body-file query.json
   ```

8. Create or update with `opero queries create` or `opero queries update`.
9. Verify with `opero --json queries get <id>` and, when safe, execute with
   representative params.

## Rules

- Use table `qualifiedName` values from schema discovery verbatim.
- Use named parameters as `:paramName`; every used parameter must be declared
  and every declared parameter must be used.
- Treat saved query `key` as an API contract. Changing it can break scripts,
  views, automations, or integrations.
- Never write DML, DDL, session, security, file, extension, or side-effect SQL.
- Do not require users to pass organization context as a parameter. Opero sets
  organization context server-side during execution.
- Do not depend on tables or columns that are absent from the discovered schema.
- Warn before changing query result columns or aliases used by downstream
  consumers.
