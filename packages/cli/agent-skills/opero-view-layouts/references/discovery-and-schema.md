# Discovery And Schema

Discovery endpoints are the source of truth for what can be placed in a View
Layout. Use them before writing draft JSON.

## Discovery Commands

```bash
opero --json view-layouts surface-capabilities
opero --json view-layouts surface-definitions --surface DYNAMIC_OBJECT
opero --json view-layouts catalog --surface DYNAMIC_OBJECT --mode CREATE --module-key <moduleKey> --object-key <objectKey> --form-id <formId>
opero --json view-layouts custom-field-types
opero --json view-layouts runtime-context-variables <layoutId> --mode CREATE
```

Use `runtime-context-variables` when blocks contain custom HTML, button URL
templates, script bindings, or runtime availability conditions.

## Surface Capabilities

Surface capabilities tell which surfaces and modes are supported. Common values:

- surfaces: `DYNAMIC_OBJECT`, `CONTRACTOR`, `ORGANIZATION`, `SALES_INVOICE`,
  `COST_INVOICE`, `DASHBOARD`, `USER`;
- modes: `CREATE`, `VIEW`, `EDIT`, `WORKSPACE`.

Use this endpoint when deciding whether the requested surface/mode combination
is possible.

## Surface Definitions

Surface definitions describe surface structure:

- default regions;
- default sections;
- required built-in blocks;
- placement rules;
- grid defaults;
- surface metadata.

Use surface definitions to bootstrap regions for a new draft and to ensure
required built-in blocks remain present for built-in surfaces.

## Block Catalog

The catalog is the main layout-builder endpoint. Query it for the exact surface,
mode, and target. For dynamic object form layouts, pass at least:

```text
surface=DYNAMIC_OBJECT
mode=CREATE|VIEW|EDIT
moduleKey=<module key>
objectKey=<object key>
formId=<form id>
```

Catalog responses include:

- categories;
- block entries;
- `defaultBlock` templates;
- `configSchema` for editable block properties;
- availability state and unavailable reasons;
- child rules for structural blocks;
- presets.

The catalog tells what blocks can be added. It is also where agents should look
for all supported block configuration properties instead of guessing.

## Using `defaultBlock`

A catalog entry is not saved directly. To add it to a draft:

1. Copy `defaultBlock`.
2. Add or preserve a stable `id`.
3. Set `regionKey`.
4. Set `displayOrder`.
5. Adjust allowed `grid`, `config`, `modeConfig`, `runtimeAvailability`, or
   `children`.
6. Keep required `type`, `source`, `ref`, lock/removable flags, and supported
   mode information intact.

When an existing block already represents the same logical field/component, keep
its `id` stable across saves.

## Custom Field Type Schemas

Use `opero --json view-layouts custom-field-types` before creating or editing
custom field definitions. Field types can have different create/update configs,
validation options, and server-provided options.

Do not infer a custom field config from another field type. Use the returned
schema for the exact type being created or updated.

## Existing Layout And OpenAPI Types

The exact persisted shape can be checked from:

- the current layout response: `opero --json view-layouts get <layoutId>`;
- a previous version: `opero --json view-layouts versions get <layoutId> <versionId>`;
- resolved runtime layout: `opero --json view-layouts resolve ...`;
- generated OpenAPI types in the CLI source when developing the CLI itself.

Prefer live discovery and current layout state over hard-coded examples.
