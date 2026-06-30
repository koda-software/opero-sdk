# Schema Discovery

Always discover schema before writing or changing saved-query SQL.

```bash
opero --json queries schema
```

This command calls:

```text
GET /v1/saved-queries/schema
```

The API token must have `api.saved_queries.read`.

## Response Shape

The response is wrapped:

```json
{
  "data": {
    "tables": [
      {
        "name": "dyn_assets",
        "schema": "runtime_dyn",
        "qualifiedName": "runtime_dyn.\"dyn_assets\"",
        "objectName": "Asset",
        "description": "Asset Management - Asset (key: asset)",
        "scope": "company_runtime",
        "availableExecutionModes": ["COMPANY", "ORGANIZATION_REPORTING"],
        "companyIdColumn": "companyId",
        "columns": [
          {
            "name": "id",
            "type": "uuid",
            "nullable": false,
            "label": "ID"
          }
        ]
      }
    ]
  }
}
```

Table fields:

- `name`: unqualified table name.
- `schema`: database schema, usually `public` or `runtime_dyn`.
- `qualifiedName`: exact SQL table reference to use.
- `columns`: queryable columns.
- `scope`: whether the table is organization configuration data or
  company-runtime data.
- `availableExecutionModes`: saved-query execution modes where the table is
  allowed.
- `companyIdColumn`: owning company column when the table exposes one directly.
- `objectName`: dynamic object display name when available.
- `description`: module/object context for dynamic tables when available.

Column fields:

- `name`: exact SQL column name.
- `type`: database-facing type hint.
- `nullable`: whether the column can be null.
- `label`: product-facing field label when available.
- `referencesTable`: referenced table hint when available.

## Table Types

The schema includes:

- Static RLS-protected Opero tables.
- Organization-owned dynamic object tables in `runtime_dyn`.

Dynamic tables represent custom objects for the current organization. Their
names often start with `dyn_`; quoted qualified names must be copied exactly
from `qualifiedName`.

Use `availableExecutionModes` when deciding whether a query should run as
`COMPANY` or `ORGANIZATION_REPORTING`. `ORGANIZATION_REPORTING` runs across
companies and requires reporting permission; `COMPANY` uses the active target
company.

## How To Pick Tables

Use product meaning first, not table-name guesswork:

- Prefer tables whose `objectName` or `description` matches the user's domain.
- Use `label` to map user-facing field names to column names.
- Use `referencesTable` to identify join paths.
- Prefer IDs for joins and stable keys for filters.
- When multiple tables look plausible, ask for the exact module/object or
  inspect existing product configuration before writing SQL.

## Quoting

Use `qualifiedName` verbatim:

```sql
from runtime_dyn."dyn_assets" as asset
```

Do not simplify quoted dynamic table names. Do not invent `runtime_dyn.dyn_x`
when schema discovery returned a quoted value.

Use table aliases for readability, but keep output aliases explicit and stable.
