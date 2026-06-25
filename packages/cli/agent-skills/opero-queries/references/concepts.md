# Opero Query Concepts

Saved queries are named SQL definitions stored in Opero. They let product
features reuse a stable data contract instead of embedding SQL in each consumer.

## Essence

Create an Opero query by translating a business question into a stable,
read-only SQL contract:

1. Discover the schema available to the organization.
2. Select the authoritative tables and columns.
3. Decide the output columns and aliases consumers will depend on.
4. Add named parameters for values that must vary at runtime.
5. Keep the SQL read-only, deterministic, and scoped by Opero runtime security.
6. Validate with `opero queries validate`.
7. Save with `opero queries create` or `opero queries update`.
8. Verify the result shape and document the query key and parameters for
   consumers.

The important artifact is not only the SQL text. It is the combination of
`key`, SQL, parameter declarations, result columns, and downstream consumers.

## Scope

Saved queries can be:

- `ORGANIZATION`: owned by the current organization and editable in that org.
- `SYSTEM`: shared system-provided queries. These are not normal org-authored
  queries and should not reference organization dynamic tables.

Agents usually create or edit organization queries.

## Query Key

The `key` is a stable machine-facing identifier. Scripts, layouts, automation,
and integrations can call a query by key, so treat it like an API route:

- Choose a short, descriptive, stable key.
- Prefer lower-case words separated by hyphens or underscores if the product
  surface allows it.
- Do not rename a key casually.
- Before deletion or rename, inspect consumers and prefer a new query when the
  contract must change substantially.

## Consumers

Saved queries can be used by:

- View layouts, especially SQL-backed select and multi-select field options.
- Custom scripts through query helper APIs.
- Automation and reporting surfaces.
- External integrations through the saved-query API.

Consumers often depend on exact result column names. Changing an alias can be a
breaking change even when SQL still validates.

## Result Shape

Result shape is inferred from SQL. Use explicit aliases to make the contract
clear:

```sql
select
  asset.id as asset_id,
  asset.name as asset_name,
  owner.email as owner_email
from runtime_dyn."dyn_assets" as asset
left join users as owner on owner.id = asset.owner_id
```

Avoid `select *` for saved queries. It makes result contracts unstable and can
return unnecessary data.
