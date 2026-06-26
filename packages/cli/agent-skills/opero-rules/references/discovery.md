# Rules Discovery

Always discover available rule building blocks before creating or editing rule
payloads.

## Health

```bash
opero --json doctor
```

## Builder Metadata

Load trigger metadata:

```bash
opero --json rules config
```

Look for:

- trigger `type`;
- label and description;
- category;
- `requiresObject`;
- `configSchema`.

Search step types:

```bash
opero --json rules step-types
opero --json rules step-types --search webhook
opero --json rules step-types --category records
```

Look for:

- step `type`;
- category;
- label and description;
- `supportsContextKey`;
- `configSchema`.

## Entity Fields

Use entity fields before referencing record fields in triggers, conditions,
templates, scripts, or update steps.

```bash
opero --json rules entity-fields --entity-type contractor
opero --json rules entity-fields --entity-type custom_record --module-key <moduleKey> --object-key <objectKey>
```

For dynamic/custom records, inspect the custom object schema as well when the
user asks for a data-model-sensitive rule:

```bash
opero --json custom-objects get <moduleKey> <objectKey>
opero --json custom-objects schema <moduleKey> <objectKey>
```

## Existing Rules

List and read rules before editing or creating a near-duplicate:

```bash
opero --json rules list --limit 50
opero --json rules get <ruleId>
```

Useful list fields include:

- `id`
- `name`
- `category`
- `description`
- `summary`
- `isActive`
- `scope`
- `triggerType`
- `triggerObjectId`
- `stepCount`
- `executionCount`
- `createdAt`
- `updatedAt`

## Related Rules

Before changing a module, object, or field used by rules, check related rules:

```bash
opero --json rules related-custom-module <moduleKey>
opero --json rules related-custom-object <moduleKey> <objectKey>
opero --json rules related-custom-field <fieldDefinitionId>
```

Review related rules before deleting or renaming schema that a trigger,
condition, script, or update step may depend on.
