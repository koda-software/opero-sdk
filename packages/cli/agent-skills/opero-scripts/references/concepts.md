# Concepts

Custom Scripts are reusable, organization-scoped JavaScript snippets for UI and
runtime behavior. They are intended for product customization and workflow
ergonomics, not for security enforcement.

## Registry Record

A custom script has:

- `id`
- `key`: stable organization-local identifier, unique inside the organization.
- `name`
- `description`
- `type`
- `status`: `ACTIVE` or `ARCHIVED`
- `code`: JavaScript function body.
- `validationStatus`: `VALID`, `INVALID`, or `NOT_VALIDATED`
- `validationErrors`
- `executionMode`: `SYNC` or `ASYNC`
- `dependencies`: referenced scripts, queries, and actions.
- `metadata`
- `usageCount`: number of layout/field bindings referencing the script.

## Lifecycle

Scripts are created, updated, archived, restored, and deleted through
`opero custom-scripts ...` commands.

There is no script versioning. Updating an active script changes behavior for
all consumers after the relevant UI/runtime payload reloads. Inspect
`usageCount` before editing or archiving a script.

## Bindings

View Layout script bindings connect a script to a hook, target, enabled state,
priority, and config. The binding explains when and where the script runs. The
script registry stores reusable source code.

For option filtering, create an `OPTION_FILTER` custom script and bind it in the
View Layout draft `scriptBindings` with `hook: "optionFilter"`. Do not attach it
to dynamic object field `options`; `options.optionFilterScriptId` is not
supported.

Enabled layout bindings require active, valid scripts. A script can be valid by
itself but invalid for a specific layout binding if the hook/type/target do not
match.

## Runtime

Custom Scripts execute in frontend-owned runtime contexts. The backend stores
and statically validates the function body. The frontend builds `ctx` and owns
the live runtime behavior.

Script output is UI behavior only. Do not treat script output as trusted server
state.
