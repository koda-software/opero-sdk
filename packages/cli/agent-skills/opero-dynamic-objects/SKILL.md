---
name: opero-dynamic-objects
description: Use when creating, updating, inspecting, validating, deleting, or explaining Opero dynamic/custom objects, fields, relationships, object-scoped schema drafts, custom records, singleton records, object delete impact, and safe data-model changes inside a custom module.
---

# Opero Dynamic Objects

Use this skill for Opero dynamic/custom objects: business record types inside a
module, such as Company, Contact, Deal, Asset, Ticket, or Line Item.

Object schema changes are made through object-scoped schema drafts. Module
scope is for grouping and inspection; forms and View Layouts control how users
see or edit records.

## References

Read only the reference needed for the task:

- `references/concepts.md`: what objects are and how they relate to modules,
  fields, records, relationships, forms, View Layouts, queries, scripts, and
  workflows.
- `references/field-types.md`: supported field types, value kinds, selection
  sources, dictionary-backed selects, and type-specific `options`.
- `references/discovery.md`: inspect modules, objects, schema context,
  available fields, references, and object API exposure.
- `references/schema-drafts.md`: create, update, validate, apply, list, get, and
  delete object-scoped schema drafts.
- `references/records.md`: list, get, create, update, delete, and singleton
  record workflows.
- `references/relationships.md`: reference fields, subordinate objects,
  relation-table implications, and cross-feature impact.
- `references/delete-safety.md`: object delete impact, destructive field
  changes, confirmations, and safer alternatives.
- `references/payloads.md`: compact JSON examples for common object, field,
  record, draft, apply, and delete payloads.

## Before You Start

Before changing an object:

- Know the module and object.
- Know whether the user wants an object change, field change, relationship
  change, record change, or delete.
- Understand what the user wants to store or change in plain language.
- Read current object/schema state before planning the payload.
- For every field create/update, fetch the exact field-type contract.
- For new regular objects, plan to create default forms and the form-owned View
  Layout by setting `createDefaultForm: true`, unless the user explicitly does
  not want forms/layouts.
- For object edits, inspect existing forms and View Layouts and ask whether new
  or changed fields should also be added to those layouts.
- If existing data may be deleted or cleared, preview impact and explain it.

Before creating, updating, applying, or deleting, summarize:

```text
I will change this object:
- Module: ...
- Object: ...
- Change: ...
- Forms/layouts: create/update/leave unchanged
- Data risk: ...
- Validation or impact check: ...
```

Do not create, update, apply, or delete until the user approves.

## Default Procedure

1. Run `opero --json doctor` unless recent context proves auth and API
   reachability.
2. Inspect current state:

   ```bash
   opero --json custom-objects list <moduleKey>
   opero --json custom-objects get <moduleKey> <objectKey>
   opero --json custom-objects schema <moduleKey> <objectKey>
   ```

3. For field schema changes, read `references/field-types.md` and fetch the
   exact contract before writing payloads:

   ```bash
   opero --json custom-objects field-types get <type>
   ```

4. For schema changes, read `references/schema-drafts.md`, prepare an
   object-scoped draft, validate it, review the plan/errors, then apply only
   after approval.
5. When creating a regular object, include `draft.object.createDefaultForm:
   true` by default so Opero creates default `CREATE`, `VIEW`, and `EDIT` forms
   and the owned View Layout container. Do not use it for subordinate objects.
6. When adding or changing fields on an existing object, inspect forms and
   layouts and ask whether to update layouts:

   ```bash
   opero --json request get /v1/custom-modules/<moduleKey>/objects/<objectKey>/forms
   opero --json request get /v1/custom-modules/<moduleKey>/objects/<objectKey>/forms/defaults
   ```

7. For record changes, read `references/records.md` and use custom record
   commands.
8. For delete requests, run delete impact before deleting:

   ```bash
   opero --json custom-objects delete-impact <moduleKey> <objectKey>
   ```

9. Verify the result with object/schema/record read commands.

## Rules

- Do not use module metadata commands for object or field schema changes.
- Do not use module-scoped schema draft endpoints.
- Use object-scoped schema drafts for object and field mutations.
- Use stable lowercase object and field keys; do not invent keys when editing
  existing schema.
- Always verify field create/update shape with
  `opero --json custom-objects field-types get <type>` before drafting.
- For new regular objects, use `createDefaultForm: true` unless the user asks
  not to create forms/layouts. Subordinate objects cannot create default forms.
- Validate schema drafts before apply.
- After applying object or field schema changes, check whether form-owned View
  Layouts need updates. Do not assume new fields are visible to users just
  because the schema exists.
- Treat apply, object delete, field delete, and record delete as live changes.
- If the task is about forms, form defaults, access, or form-owned layouts,
  prefer `opero-dynamic-forms` or `opero-view-layouts` when installed.
