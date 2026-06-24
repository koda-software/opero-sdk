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
- Joins, filters, aggregates, sorting, and query lifecycle.
- Debugging SQL or query execution failures.

Query tasks should verify schema and expected result shape before generating or
changing SQL.
