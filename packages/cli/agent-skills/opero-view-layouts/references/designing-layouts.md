# Designing Layouts

Use this reference before building or reorganizing a View Layout draft. Design
the layout around the business process, not around raw schema order.

## Product Principles

- Business grouping: group fields by business meaning, such as sender,
  recipient, document metadata, document content, approvals, and audit data.
- Natural order: arrange sections in the order a person would fill or read the
  document.
- Ergonomics: choose field widths from expected data length.
- Economy: place related short fields side by side so sections stay compact and
  readable on small screens.
- Avoid database dump forms. Hide, move, or de-emphasize secondary fields when
  they distract from the primary workflow.

## Mode-Specific Layouts

Design `CREATE`, `EDIT`, and `VIEW` independently when the workflow differs.

- `CREATE`: optimize for fast, top-to-bottom entry. Put required fields early.
- `EDIT`: optimize for finding and changing existing values. Keep identity and
  status visible.
- `VIEW`: optimize for reading. Summary and status can come first; write-time
  ergonomics matter less.

Do not assume the same order and width are best for every mode.

## Sections, Columns, And Tabs

Use sections for business groups. Use columns inside a section when fields form
a visual subgroup.

Example: two grouped halves in one section:

```json
{
  "id": "section_parties",
  "type": "section",
  "source": "system",
  "ref": { "componentKey": "section" },
  "regionKey": "main",
  "displayOrder": 0,
  "grid": { "colSpan": 12 },
  "config": { "label": "Strony pisma", "wrapInCard": true },
  "children": [
    {
      "id": "column_sender",
      "type": "column",
      "source": "system",
      "ref": { "componentKey": "layout.column" },
      "regionKey": "main",
      "displayOrder": 0,
      "grid": { "colSpan": 6 },
      "config": {},
      "children": [
        {
          "id": "field_sender",
          "type": "field",
          "source": "dynamic_field",
          "ref": { "fieldKey": "sender" },
          "regionKey": "main",
          "displayOrder": 0,
          "grid": { "colSpan": 12 },
          "config": { "label": "Nadawca" },
          "children": []
        }
      ]
    },
    {
      "id": "column_recipient",
      "type": "column",
      "source": "system",
      "ref": { "componentKey": "layout.column" },
      "regionKey": "main",
      "displayOrder": 1,
      "grid": { "colSpan": 6 },
      "config": {},
      "children": [
        {
          "id": "field_recipient",
          "type": "field",
          "source": "dynamic_field",
          "ref": { "fieldKey": "recipient" },
          "regionKey": "main",
          "displayOrder": 0,
          "grid": { "colSpan": 12 },
          "config": { "label": "Odbiorca" },
          "children": []
        }
      ]
    }
  ]
}
```

Use tabs only for large forms that are hard to scan on one page, or when the
user explicitly asks for tabs. Avoid putting required create-mode fields in
later tabs.

## Grid Widths

The layout grid has 12 columns. Regions declare their grid with
`regions[].columns`, usually `12`.

- Use `grid.colSpan` for width.
- Use `grid.colStart` only when explicit placement is needed.
- Omit `grid.colStart` for automatic placement. The editor may show this as
  `auto`, but draft JSON stores numeric `colStart` only when explicit.

Typical widths:

- `12`: long text, textarea, address, custom HTML, relation table.
- `6`: names, emails, references, balanced pairs.
- `4`: date, status, category, medium select.
- `3`: short code, small number, compact status, yes/no.
- `2` or `1`: only for very small values and when labels remain readable.

Examples:

```json
{ "grid": { "colSpan": 6 } }
{ "grid": { "colSpan": 6, "colStart": 7 } }
```

Columns are also grid items. A common pattern is two `column` blocks with
`grid.colSpan: 6`; fields inside each column can then use `grid.colSpan: 12`
inside that column's own grid.

## Field Config

Use layout-level config to improve this form without changing the underlying
field definition. Confirm supported config with the catalog or current block
before saving.

Common field block config keys:

```json
{
  "config": {
    "label": "Numer pisma",
    "placeholder": "NP/2026/001",
    "helpText": "Numer zgodny z rejestrem korespondencji.",
    "hideLabel": false,
    "isRequired": true,
    "readOnly": false,
    "displayMode": "table"
  }
}
```

Use `config.label` as a label override. Do not rename the underlying field just
to change how it appears in this layout.

Keep labels short. Use `config.helpText` when extra explanation is needed. Use
`config.placeholder` for examples, not business rules.

Use `config.hideLabel: true` only when surrounding content already explains the
meaning, such as generated summaries, obvious custom HTML, or fields inside a
strongly named section.

Use `config.displayMode` only for field types that support it. Known runtime
values include reference modes `list`, `table`, and `tiles`, file modes `any`
and `image`, and files mode `gallery`.

Some visual field settings live in `presentation`, not `config`; preserve
existing `presentation` unless changing display behavior intentionally.

## Required, Read-Only, And Secondary Data

Put required fields early in create and edit flows. Do not hide required inputs
in tabs unless the user explicitly wants a multi-step form.

Use `config.isRequired` only as a layout-level override when supported by the
field block. Runtime saves may still be constrained by the published layout and
external custom object profile.

Put read-only or system fields lower, in a sidebar, or in a metadata section
when they are not part of the main task. Use `config.readOnly` only when the
block supports layout-level read-only behavior.

## Sidebar And Secondary Regions

Use secondary regions for compact context such as status, owner, dates,
workflow state, and audit metadata. Do not move primary document content into a
sidebar.

Example region shape:

```json
{
  "key": "sidebar",
  "label": "Sidebar",
  "layout": "sidebar",
  "columns": 4,
  "displayOrder": 1,
  "config": {}
}
```

Blocks placed in a secondary region must still reference that region with
`regionKey`.

## Relation Tables

Use relation tables for one-to-many child data. Keep them separate from scalar
fields and usually place them after the main form content, unless the table is
the primary task.

Example:

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
  "displayOrder": 3,
  "grid": { "colSpan": 12 },
  "config": {
    "columns": ["text", "created_at"],
    "targetMode": "VIEW"
  },
  "children": []
}
```

## Buttons And Actions

Place buttons close to the workflow moment they support. Avoid mixing action
buttons into pure data sections unless the context makes the action obvious.

Use the catalog `defaultBlock` for exact button shape. Button config can differ
by action, such as opening a URL or executing a rule.

## Custom HTML

Use custom HTML for summaries, instructions, rendered previews, or read-only
computed presentation. Do not replace editable or searchable fields with custom
HTML when the data should remain structured.

Example:

```json
{
  "id": "html_document_preview",
  "type": "custom_html",
  "source": "system",
  "ref": { "componentKey": "custom_html" },
  "regionKey": "main",
  "displayOrder": 2,
  "grid": { "colSpan": 12 },
  "config": {
    "html": "<section><h2>{{ record.title }}</h2></section>",
    "css": null
  },
  "children": []
}
```

Before using template expressions, inspect runtime variables.

## Visibility, Scripts, And Runtime Context

First design a clear static layout. Add dynamic behavior only when it
simplifies the form.

Use `runtimeAvailability` for block availability:

```json
{
  "runtimeAvailability": {
    "condition": {
      "logic": "AND",
      "conditions": [
        {
          "value1": "{{ workflow.stage.parameters.showAccountingSection }}",
          "operator": "EQUALS",
          "value2": true
        }
      ]
    }
  }
}
```

Supported leaf operators include `EQUALS`, `NOT_EQUALS`, `GREATER_THAN`,
`GREATER_THAN_OR_EQUALS`, `LESS_THAN`, `LESS_THAN_OR_EQUALS`, `CONTAINS`,
`NOT_CONTAINS`, `IS_EMPTY`, and `IS_NOT_EMPTY`.

Use `scriptBindings` for script-backed behavior:

```json
{
  "id": "binding_visibility_amount",
  "scriptId": "script_id",
  "hook": "fieldVisibility",
  "target": {
    "blockId": "field_amount",
    "fieldKey": "amount"
  },
  "enabled": true,
  "priority": 0,
  "config": {}
}
```

Supported hooks include `optionFilter`, `fieldVisibility`, `fieldReadonly`,
`fieldDefault`, `fieldChange`, `beforeAction`, `afterAction`, `onRender`, and
`onBlockRender`.

Use `fieldChange` for async follow-up after the user changes one field, such as
calculating related values, calling saved queries, sending HTTP requests,
notifying users, or updating another form value. It is field-targeted and
non-DOM. It runs in dynamic object create/edit forms and public dynamic forms,
not for view-only fields. Return values are ignored.

Example:

```json
{
  "id": "binding_amount_field_change",
  "scriptId": "script_id",
  "hook": "fieldChange",
  "target": {
    "blockId": "field_amount",
    "fieldKey": "amount"
  },
  "enabled": true,
  "priority": 0,
  "config": {}
}
```

Before writing Liquid expressions, custom HTML templates, button URL templates,
availability rules, or scripts, inspect context variables:

```bash
opero --json view-layouts runtime-context-variables <layoutId> --mode EDIT --record-id <recordId>
```

Use only variables returned by that endpoint or present in resolved runtime
context.

## Preserve Existing Blocks

When redesigning, move existing blocks and keep stable `id` values whenever the
logical field or component remains the same. Recreate a block only when it
should represent a different thing.

When changing an existing layout, start from the current draft or published
version, preserve regions, blocks, staged fields, `scriptBindings`, metadata,
and `presentation` that should remain, then save the full draft and inspect
validation.
