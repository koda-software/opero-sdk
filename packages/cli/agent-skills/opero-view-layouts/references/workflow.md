# Workflow

## Concepts

View Layouts define how an Opero screen or custom object form is arranged. A
layout contains regions and blocks. Blocks can represent fields, sections, tabs,
relation tables, buttons, custom HTML, built-in surface components, or dashboard
items.

Important terms:

- `surface`: page family, such as `DYNAMIC_OBJECT`, `CONTRACTOR`,
  `ORGANIZATION`, `SALES_INVOICE`, `COST_INVOICE`, `DASHBOARD`, or `USER`.
- `mode`: runtime use, such as `CREATE`, `VIEW`, `EDIT`, or `WORKSPACE`.
- `target`: surface-specific context. Dynamic object layouts use `moduleKey`,
  `objectKey`, and often `formId`.
- `region`: named area where blocks are placed, such as `main` or `sidebar`.
- `draft`: editable layout version. Drafts are not live.
- `published version`: version used by runtime resolve and record save
  endpoints.

## Form-Owned Layouts

For custom object forms, start from the form. Creating a form creates one owned
View Layout and returns `viewLayoutId`. Use that layout ID for draft saves,
publishing, version history, and runtime checks.

Newly created form-owned layouts may be `DRAFT_ONLY`. This is expected. Save the
returned `viewLayoutId`, edit the draft, validate it, and publish before using
the form at runtime. Check form defaults to confirm which form ids are used for
`CREATE`, `VIEW`, and `EDIT`.

Do not create a separate `DYNAMIC_OBJECT` View Layout with `target.formId`.
Form-owned layouts are managed by the form, and their supported modes mirror the
form `types`. If form modes are wrong, update the form, not the layout metadata.

If the CLI does not have a curated command for the form operation, use
`opero request` with the external API path, for example:

```bash
opero --json request get /v1/custom-modules/<moduleKey>/objects/<objectKey>/forms
opero --json request get /v1/custom-modules/<moduleKey>/objects/<objectKey>/forms/<formId>
opero request post /v1/custom-modules/<moduleKey>/objects/<objectKey>/forms --body-file form.json
opero request patch /v1/custom-modules/<moduleKey>/objects/<objectKey>/forms/defaults --body-file defaults.json
```

Use `view-layouts create` only for layouts that are not owned by a custom object
form, such as organization, contractor, user, invoice, or dashboard layouts.

## Standard Edit Flow

1. Determine surface, mode, and target.
2. Read the existing layout.
3. Load surface definitions and catalog for the exact target and mode.
4. If custom fields are involved, load custom field type schemas.
5. Plan the desired regions and blocks.
6. Build a complete draft payload.
7. Save the draft and inspect validation.
8. Publish only after validation passes.
9. Resolve the published layout to verify runtime shape.

Useful commands:

```bash
opero --json view-layouts list --surface DYNAMIC_OBJECT --mode EDIT --module-key <moduleKey> --object-key <objectKey> --form-id <formId>
opero --json view-layouts get <layoutId>
opero --json view-layouts versions list <layoutId>
opero --json view-layouts catalog --surface DYNAMIC_OBJECT --mode EDIT --module-key <moduleKey> --object-key <objectKey> --form-id <formId>
opero view-layouts draft save <layoutId> --body-file draft.json
opero view-layouts publish <layoutId> --body-file publish.json
opero --json view-layouts resolve --surface DYNAMIC_OBJECT --mode EDIT --module-key <moduleKey> --object-key <objectKey> --form-id <formId>
```

## Planning From User Intent

Translate visual/user requests into explicit layout decisions:

- Which mode is being changed: create, view, edit, or workspace?
- Which fields must be visible, required, read-only, hidden, or grouped?
- Which root sections or tabs are needed?
- Which fields go directly in a section, and which go inside section columns?
- Which fields belong in primary content vs sidebar/secondary regions?
- Are relation tables needed? If yes, what target mode and columns?
- Are new custom fields needed, or only existing fields?
- Are buttons, custom HTML, runtime conditions, or scripts involved?
- Should the change affect an existing form layout or a new non-form layout?

When the user request is ambiguous, inspect current layout and catalog first.
Ask only when the ambiguity would change data model behavior, destructive field
changes, public form behavior, or publishing.

## Direct Layout Metadata

Use these commands for layout container metadata:

```bash
opero view-layouts create --body-file layout.json
opero view-layouts update <layoutId> --body-file layout.json
opero view-layouts archive <layoutId>
```

For form-owned layouts, avoid metadata changes to `surface`, `target`, or
`supportedModes`. Change form configuration instead.
