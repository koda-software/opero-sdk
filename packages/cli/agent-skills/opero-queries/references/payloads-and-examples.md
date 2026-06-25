# Payloads And Examples

Use these examples as starting points and adapt names to discovered schema.

## Saved Query Payload Shape

Create and validate payloads use this shape:

```json
{
  "name": "Active assets by owner",
  "key": "active-assets-by-owner",
  "description": "Lists active assets assigned to an owner.",
  "sql": "select asset.id as asset_id, asset.name as asset_name from runtime_dyn.\"dyn_assets\" as asset where asset.owner_id = :ownerId and asset.archived_at is null order by asset.name asc, asset.id asc",
  "parameters": [
    {
      "name": "ownerId",
      "type": "uuid",
      "required": true,
      "description": "Owner user id"
    }
  ]
}
```

Common fields:

- `name`: human-facing name.
- `key`: stable machine-facing key.
- `description`: optional purpose and consumer notes.
- `sql`: read-only SQL.
- `parameters`: named parameter declarations.

Validate before saving:

```bash
opero --json queries validate --body-file active-assets-by-owner.json
```

Create:

```bash
opero queries create --body-file active-assets-by-owner.json
```

Update:

```bash
opero queries update <id> --body-file active-assets-by-owner.json
```

Execute payloads use a `params` wrapper:

```json
{
  "params": {
    "ownerId": "00000000-0000-0000-0000-000000000000"
  }
}
```

Execute:

```bash
opero --json queries execute <id> --body-file execute.json
```

## SQL-Backed Select Options

For dropdowns, return explicit value and label columns:

```sql
select
  asset.id as value,
  asset.name as label,
  asset.serial_number as meta_serial_number
from runtime_dyn."dyn_assets" as asset
where asset.archived_at is null
  and (:search is null or asset.name ilike '%' || :search || '%')
order by asset.name asc, asset.id asc
```

Parameters:

```json
[
  {
    "name": "search",
    "type": "string",
    "required": false,
    "description": "Optional user search text"
  }
]
```

## Record-Scoped Related Rows

```sql
select
  task.id as task_id,
  task.name as task_name,
  task.status as status,
  task.due_date as due_date
from runtime_dyn."dyn_tasks" as task
where task.project_id = :projectId
order by task.due_date asc nulls last, task.id asc
```

Parameters:

```json
[
  {
    "name": "projectId",
    "type": "uuid",
    "required": true,
    "description": "Project record id"
  }
]
```

## Aggregated Metric

```sql
select
  task.status as status,
  count(*)::int as task_count
from runtime_dyn."dyn_tasks" as task
where (:projectId is null or task.project_id = :projectId)
group by task.status
order by task.status
```

Parameters:

```json
[
  {
    "name": "projectId",
    "type": "uuid",
    "required": false,
    "description": "Optional project filter"
  }
]
```

## Script Consumer Example

When a script helper surface can run saved queries by key, pass parameter values
by parameter name:

```javascript
const result = await ctx.queries.run('active-assets-by-owner', {
  ownerId: ctx.user.id,
})

return result.rows
```

Keep query keys and parameter names stable because scripts can depend on them
statically.

## Review Checklist

- Does the SQL use only discovered tables and columns?
- Does every table reference use `qualifiedName` or an exact schema-qualified
  equivalent from discovery?
- Is the query read-only and a single statement?
- Are all output aliases stable and consumer-friendly?
- Is every `:paramName` declared exactly once?
- Is every declared parameter used?
- Are optional parameters handled with null-aware predicates?
- Would changing this query break existing consumers?
