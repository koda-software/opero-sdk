# Metadata

Module metadata describes the module itself. It does not change object fields or
records.

## List And Inspect

```bash
opero --json custom-modules list
opero --json custom-modules get <moduleKey>
opero --json custom-modules schema <moduleKey>
```

Use `get` for module metadata. Use `schema` when the task mentions objects,
fields, references, record counts, or schema planning.

## Create

```bash
opero custom-modules create --body-file module.json
```

Typical body:

```json
{
  "key": "crm",
  "name": "CRM",
  "description": "Customer relationship management",
  "icon": "briefcase",
  "color": "#2563EB",
  "isActive": true,
  "isHidden": false
}
```

Use stable, lowercase, readable keys. A module key is a long-lived identifier
used by commands, schema, records, queries, scripts, and integrations.

## Update

```bash
opero custom-modules update <moduleKey> --body-file module-update.json
```

Typical body:

```json
{
  "name": "Customer Management",
  "description": "CRM data and customer workflows",
  "isHidden": false
}
```

Only include fields that should change.

## Hide, Activate, Or Deactivate

Use metadata update for visibility and active-state changes:

```json
{
  "isHidden": true
}
```

```json
{
  "isActive": false
}
```

Hiding changes UI visibility. Deactivating can affect whether module features
are usable. Inspect current state and ask for approval before changing either.

## Metadata Is Not Schema

Do not use metadata update to add objects or fields. For objects and fields,
use object-scoped schema workflows.
