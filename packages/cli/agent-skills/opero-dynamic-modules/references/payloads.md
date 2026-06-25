# Payloads

Use payload files and pass them with `--body-file`.

## Module Create

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

```bash
opero custom-modules create --body-file module.json
```

## Module Update

```json
{
  "name": "Customer Management",
  "description": "Customer records and sales processes",
  "isHidden": false
}
```

```bash
opero custom-modules update crm --body-file module-update.json
```

## Schema Context

Inspect module schema before planning object or field work:

```bash
opero --json custom-modules schema crm
```

Module scope is for inspection. Use object-scoped schema commands for schema
mutation.
