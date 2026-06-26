# Blocks

Blocks are the building units of a View Layout.

View Layout blocks follow the Puck editor data model: author the screen as
ordered regions containing component-like blocks, with nested blocks under
`children` and editable component props in `config` and `presentation`.

## Block Anatomy

Most draft blocks have this shape:

```json
{
  "id": "field_title",
  "type": "field",
  "source": "dynamic_field",
  "ref": { "fieldKey": "title" },
  "regionKey": "main",
  "displayOrder": 0,
  "grid": { "colSpan": 12 },
  "config": { "label": "Title" },
  "presentation": null,
  "modeConfig": {},
  "runtimeAvailability": null,
  "requiredPolicy": "required",
  "locked": false,
  "removable": true,
  "singleInstance": true,
  "supportedModes": ["CREATE", "EDIT"],
  "children": []
}
```

Important fields:

- `id`: stable client-visible block ID.
- `type`: kind of block.
- `source`: where the block comes from.
- `ref`: field, relation, component, or other referenced item.
- `regionKey`: region where a top-level block is placed.
- `displayOrder`: order inside a region or parent.
- `grid`: placement such as column span.
- `config`: editable behavior and general block options.
- `presentation`: typed presentation settings when the catalog/schema exposes
  them.
- `modeConfig`: mode-specific settings.
- `runtimeAvailability`: optional condition controlling runtime availability.
- `requiredPolicy`: `optional`, `required`, or `system_locked`.
- `children`: nested blocks.

Runtime responses may include `meta`; draft saves may round-trip it, but it is
runtime metadata rather than a primary authoring target.

## Sources

Common sources:

- `dynamic_field`: field from a dynamic/custom object.
- `dynamic_relation`: relation or relation table from a dynamic/custom object.
- `custom_field`: custom field on a built-in surface.
- `draft_custom_field`: custom field definition staged in the current draft.
- `built_in`: built-in surface component or field.
- `system`: structural layout blocks such as sections, tabs, columns, buttons,
  and custom HTML.
- `module`: module-provided block.
- `dashboard`: dashboard workspace block.

## Ref Shapes

Use the catalog `defaultBlock` as source of truth. Common refs:

```json
{ "fieldKey": "title" }
```

```json
{ "fieldDefinitionId": "custom_field_priority" }
```

```json
{ "draftFieldDefinitionId": "draft_priority" }
```

```json
{ "relationFieldKey": "comments" }
```

```json
{ "componentKey": "layout.section" }
```

## Fields

Dynamic object fields use:

```json
{
  "type": "field",
  "source": "dynamic_field",
  "ref": { "fieldKey": "priority" }
}
```

Built-in surface custom fields use:

```json
{
  "type": "field",
  "source": "custom_field",
  "ref": { "fieldDefinitionId": "custom_field_priority" }
}
```

Staged new or changed fields use `source: "draft_custom_field"` and
`ref.draftFieldDefinitionId`.

## Required Layout Hierarchy

Build layouts with this firm parent-child structure:

```text
Root
|-- Section
|   |-- Field
|   `-- Column
|       `-- Field
`-- Tabs
    `-- Section
        |-- Field
        `-- Column
            `-- Field
```

Rules:

- Only tabs and sections can be root blocks.
- Sections can be root blocks or direct children of tabs.
- Columns can only be children of sections.
- Fields can only be children of sections or columns.

Do not place fields directly on the root/region. Do not place columns directly
on the root or inside tabs. Do not place sections inside columns.

Use sections to group fields under a heading. Use `config.wrapInCard: true` for
sections by default, unless the user explicitly asks for no card or the form
clearly should not be card-wrapped. Use columns to split content inside a
section. Use tabs as a root-level parent containing sections.

The catalog advertises child rules such as allowed child types, allowed sources,
minimum and maximum children, and placement constraints. Validate planned
nesting against those rules before saving.

When creating a simple form, start with one root section and place fields inside
that section. Add columns only when the user asks for side-by-side layout. Add
tabs only when the user asks for separated groups or a multi-tab form.

## Relation Tables

Relation tables represent one-to-many dynamic object relations:

```json
{
  "id": "relation_comments",
  "type": "relation_table",
  "source": "dynamic_relation",
  "ref": {
    "relationFieldKey": "comments",
    "moduleKey": "support",
    "objectKey": "ticket_comment"
  },
  "regionKey": "main",
  "displayOrder": 2,
  "config": {
    "columns": ["text", "created_at"],
    "targetMode": "VIEW"
  },
  "supportedModes": ["VIEW", "EDIT"],
  "children": []
}
```

Use runtime relation-table endpoints to resolve target row layouts and query row
data. Relation table saves happen inside the parent record create/update
payload, not as separate View Layout block saves.

## Buttons, Custom HTML, And Runtime Conditions

Buttons are system blocks. Supported button actions include opening URLs and
executing rules when the catalog allows them.

For custom HTML, button URL templates, scripts, and runtime availability
conditions, inspect runtime context variables:

```bash
opero --json view-layouts runtime-context-variables <layoutId> --mode EDIT --record-id <recordId>
```

Use only variables returned by that endpoint or by the resolved runtime context.

## Moving Or Changing Blocks

To change layout structure:

1. Keep the same `id` for the same logical block.
2. Change `type`, `source`, and `ref` only when the block should represent a
   different thing.
3. Change `config` for behavior/general options and `presentation` for typed
   display settings when available.
4. Move root tabs/sections by changing `regionKey` and `displayOrder`.
5. Move fields by changing the section/column `children` that contains them.
6. Keep columns under sections and fields under sections or columns.
7. Save the full draft and inspect validation.
