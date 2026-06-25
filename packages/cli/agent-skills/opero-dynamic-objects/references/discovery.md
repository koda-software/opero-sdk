# Discovery

Always inspect current state before planning changes.

## List And Inspect Objects

```bash
opero --json custom-modules get <moduleKey>
opero --json custom-objects list <moduleKey>
opero --json custom-objects get <moduleKey> <objectKey>
```

Use `custom-objects get` to see the external object profile: fields, readable
and writable flags, expandable fields, singleton status, and enabled record
operations.

## Read Schema Context

```bash
opero --json custom-objects schema <moduleKey> <objectKey>
opero --json custom-objects schema <moduleKey> <objectKey> --mode create
opero --json custom-objects schema <moduleKey> <objectKey> --mode update
```

The schema context includes:

- module metadata;
- all objects in the module;
- current object metadata and fields;
- incoming and outgoing references;
- record counts;
- `schemaHash`;
- requested operation context.

Use `schemaHash` as `baseSchemaHash` when creating a schema draft. If the schema
changes before apply, validation or apply may report a stale draft.

## Read Field Type Contracts

Before creating or updating any dynamic object field, fetch the runtime
field-type contract:

```bash
opero --json custom-objects field-types
opero --json custom-objects field-types get <type>
```

Use the single-type response as the source of truth for that field type:

- `createSchema`: field-create payload shape.
- `updateSchema`: field-update payload shape.
- `optionsSchema`: allowed `options` object.
- `valueSchema`: record value shape.
- `defaults`: omitted/defaultable field properties.
- `examples`: concrete field payload examples.
- `notes`: backend-specific constraints.

This is more authoritative than stale OpenAPI types or copied examples.

## What To Look For

- Existing object and field keys.
- Existing field ids when editing or deleting fields.
- Field types and options.
- `recordCount` before destructive changes.
- Incoming references from other objects.
- Outgoing references to other objects.
- Whether the object is singleton.
- Whether record operations are enabled in the external profile.

If a user says "add this to the form", route to forms or View Layouts. If they
say "store this value on records", plan a field schema change first.
