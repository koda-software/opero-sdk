# Specialized Opero Skills

Use this reference to decide whether a task should stay in the general
`opero-cli` workflow or move to a more specific Opero skill.

If a referenced specialized skill is not installed, use this routing guidance as
a boundary and rely on authoritative documentation or CLI output before writing
detailed instructions.

## `opero-workflows`

Use when the task involves:

- Workflow concepts.
- Workflow stages.
- Stage properties.
- Transitions.
- Transition properties or rules.
- Workflow lifecycle.
- Creating, editing, validating, or explaining workflow behavior.

Do not rely only on generic CLI knowledge for workflow changes. Use product docs
and implementation research before writing or applying workflow payloads.

## `opero-dictionaries`

Use when the task involves:

- Dictionaries or reusable option lists.
- Dictionary entries, entry keys, labels, translations, or active state.
- Dictionary entry metadata schema.
- Dictionary create, update, delete, import, or export.
- Choosing `MERGE` vs `REPLACE` for dictionary entry imports.
- Replacing, deactivating, or preserving dictionary entries.

Dictionary tasks should inspect the current dictionary before writes. Preserve
existing entries unless replacement is explicitly approved, and prefer
deactivating entries over removing keys that existing data may reference.

## `opero-view-layouts`

Use when the task involves:

- Creating or editing view layouts.
- Choosing view blocks.
- Laying out fields and sections based on user intent.
- Mapping schema or object data to a UI layout.
- Preserving existing layout structure.
- Validating layout payloads.

View-layout tasks should inspect schema and existing layout state before
planning changes.

## `opero-dynamic-modules`

Use when the task involves:

- Custom modules.
- Module metadata such as name, icon, color, active state, or hidden state.
- Module schema context.
- Routing object or field schema changes to object-scoped workflows.
- Module delete impact.
- Explaining how modules contain dynamic objects.

Module tasks should inspect current module schema before planning object or
field work. Schema mutations should use object-scoped workflows.

## `opero-dynamic-objects`

Use when the task involves:

- Custom objects inside a module.
- Object metadata such as name, plural name, icon, color, hidden state,
  singleton state, or display label.
- Object fields and field types.
- Object-scoped schema drafts.
- References or subordinate object relationships.
- Custom records or singleton records.
- Object delete impact.
- Changing a dynamic data model.

Object tasks should inspect current object schema before planning changes,
validate schema drafts before applying them, and preview delete impact before
deleting objects or fields.

## `opero-scripts`

Use when the task involves:

- Custom scripts.
- Script types.
- Available execution context.
- Script validation.
- Creating or updating scripts.
- Inspecting execution history.
- Translating user automation requests into scripts.

Script tasks should validate scripts before saving or activating them whenever
validation commands or endpoints exist.

For Custom Scripts, use the `opero-scripts` skill. It explains the important
distinction between Custom Script save-time validation and automation rule
script validation.

## `opero-queries`

Use when the task involves:

- SQL queries.
- Creating, updating, validating, or executing queries.
- Schema discovery for reporting.
- `opero queries schema` and queryable table/column discovery.
- Joins, filters, aggregates, sorting, and query lifecycle.
- Debugging SQL or query execution failures.

Query tasks should verify schema and expected result shape before generating or
changing SQL. Use `opero queries validate` before create/update, and use
`opero queries get` plus `opero queries execute` to verify saved behavior.
