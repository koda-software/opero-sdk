# Query Parameters

Saved queries use named SQL parameters:

```sql
where asset.status = :status
  and asset.created_at >= :createdFrom
```

Parameters make one saved query reusable across views, scripts, automation, and
integrations.

## Supported Types

Parameter declarations use:

- `string`
- `number`
- `date`
- `uuid`
- `boolean`

Each parameter has:

- `name`: the placeholder name without `:`.
- `type`: one of the supported types.
- `required`: whether the caller must provide a value.
- `description`: optional explanation for the caller.

Example:

```json
[
  {
    "name": "status",
    "type": "string",
    "required": false,
    "description": "Optional asset status filter"
  },
  {
    "name": "ownerId",
    "type": "uuid",
    "required": true,
    "description": "Owner user id"
  }
]
```

## Rules

- Every `:paramName` used in SQL must be declared.
- Every declared parameter must be used in SQL.
- Do not put parameters inside quoted string literals.
- Do not confuse PostgreSQL casts with parameters. `value::uuid` is a cast, not
  a `:uuid` parameter.
- Required parameters must be supplied by callers.
- Optional omitted parameters execute as null. Write SQL to handle nulls
  intentionally.

## Optional Filters

Use null-aware predicates for optional filters:

```sql
where (:status is null or asset.status = :status)
  and (:ownerId is null or asset.owner_id = :ownerId)
```

Use required parameters when absence would make the query too broad or
ambiguous:

```sql
where asset.project_id = :projectId
```

## Consumer Mapping

Different consumers provide parameter values differently:

- Scripts usually pass a JSON object keyed by parameter name.
- View layouts can map runtime context, record values, user values, or field
  values into query parameters when the layout element supports SQL-backed
  options.
- API execution surfaces use a `params` object when available.

Always align parameter names with the consuming surface. A query can validate
but still fail at runtime if a view or script passes the wrong parameter key.

## Naming

Use descriptive camelCase names:

- `recordId`
- `projectId`
- `ownerId`
- `createdFrom`
- `includeArchived`

Avoid ambiguous names like `id`, `value`, or `filter` unless the query is very
small and the meaning is obvious.
