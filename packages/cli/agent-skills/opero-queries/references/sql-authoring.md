# SQL Authoring

Saved-query SQL should be read-only, explicit, and stable. Write it as a data
contract for consumers, not as an ad hoc database exploration query.

## Allowed Shape

Use `select` or `with` queries:

```sql
with open_tasks as (
  select
    task.project_id,
    count(*) as open_task_count
  from runtime_dyn."dyn_tasks" as task
  where task.status = 'open'
  group by task.project_id
)
select
  project.id as project_id,
  project.name as project_name,
  coalesce(open_tasks.open_task_count, 0) as open_task_count
from runtime_dyn."dyn_projects" as project
left join open_tasks on open_tasks.project_id = project.id
order by project.name
```

## Forbidden Patterns

Do not use SQL that modifies data, changes session behavior, bypasses security,
or calls side-effect functions.

Avoid:

- `insert`, `update`, `delete`, `truncate`, `merge`
- `create`, `alter`, `drop`, `grant`, `revoke`
- `copy`, `execute`, `call`, `do`
- `set`, `reset`, `discard`, `load`
- `vacuum`, `reindex`, `cluster`, `lock`
- file, extension, notification, and backend-control functions
- multiple SQL statements

If the user asks for a write operation, saved queries are the wrong tool.

## Column Selection

Prefer explicit columns:

```sql
select
  asset.id as asset_id,
  asset.name as asset_name,
  asset.serial_number as serial_number
from runtime_dyn."dyn_assets" as asset
```

Avoid:

```sql
select *
from runtime_dyn."dyn_assets"
```

Explicit columns make result schemas stable, reduce accidental data exposure,
and make downstream mapping easier.

## Joins

Use schema-discovered relationship hints where available. Join on IDs or stable
foreign keys:

```sql
select
  asset.id as asset_id,
  asset.name as asset_name,
  owner.email as owner_email
from runtime_dyn."dyn_assets" as asset
left join users as owner on owner.id = asset.owner_id
```

Use `left join` when the related record is optional and consumers still need the
base row.

## Filters

Keep filters predictable and index-friendly:

```sql
where asset.archived_at is null
  and (:status is null or asset.status = :status)
  and (:createdFrom is null or asset.created_at >= :createdFrom)
```

For user-entered search terms, prefer bounded matching and explicit columns:

```sql
where :search is null
   or asset.name ilike '%' || :search || '%'
   or asset.serial_number ilike '%' || :search || '%'
```

## Aggregates

When aggregating, name metrics clearly:

```sql
select
  task.status,
  count(*)::int as task_count
from runtime_dyn."dyn_tasks" as task
group by task.status
order by task.status
```

If consumers need zero rows represented as zero counts, join against the base
dimension and `coalesce` the metric.

## Ordering And Limits

Use deterministic `order by` for UI-facing lists. Include a stable tiebreaker
when ordering by non-unique values:

```sql
order by asset.name asc, asset.id asc
```

Execution surfaces may apply their own row limits. Do not rely on unlimited
result sets.

## Result Aliases

Use stable snake_case result aliases unless the consuming surface requires a
different convention:

```sql
select
  user_profile.full_name as owner_name,
  user_profile.email as owner_email
```

Warn before renaming aliases on existing queries.
